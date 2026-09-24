"""Hypothesis property tests for the Python scanner scripts."""
import contextlib
import importlib.util
import os
import re
import string
from pathlib import Path

from hypothesis import given, settings, strategies as st

ASSETS = Path(__file__).resolve().parent.parent


def _load_module(name, filename):
    spec = importlib.util.spec_from_file_location(name, ASSETS / filename)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


modelscan_audit = _load_module("modelscan_audit_props", "modelscan-audit.py")
npm_audit = _load_module("npm_audit_props", "npm-audit.py")
pip_audit = _load_module("pip_audit_props", "pip-audit.py")
scripttagextractor = _load_module("scripttagextractor_props", "scripttagextractor.py")


@contextlib.contextmanager
def _scanner_selection(value):
    old = os.environ.get("MODELSCAN_ENABLED_SCANNERS")
    try:
        if value is None:
            os.environ.pop("MODELSCAN_ENABLED_SCANNERS", None)
        else:
            os.environ["MODELSCAN_ENABLED_SCANNERS"] = value
        yield
    finally:
        if old is None:
            os.environ.pop("MODELSCAN_ENABLED_SCANNERS", None)
        else:
            os.environ["MODELSCAN_ENABLED_SCANNERS"] = old


scanner_names = st.sampled_from(sorted(modelscan_audit.ALL_SCANNERS))

identifier = st.text(
    alphabet=string.ascii_letters + string.digits + "-_./",
    min_size=1,
    max_size=12,
).filter(lambda s: not any(s.startswith(p) for p in ("-", ".", "/")))


# ── modelscan-audit: scanner selection ───────────────────────────────────────

@given(names=st.sets(scanner_names, min_size=1, max_size=5))
def test_scanner_selection_selects_exactly_the_requested(names):
    with _scanner_selection(",".join(names)):
        assert modelscan_audit._enabled_scanners() == names


@given(names=st.sets(scanner_names, min_size=1, max_size=5))
def test_scanner_selection_ignores_whitespace_and_case(names):
    with _scanner_selection(",".join(f"  {n.upper()} " for n in names)):
        assert modelscan_audit._enabled_scanners() == names


@given(names=st.sets(scanner_names, min_size=1, max_size=5))
def test_scanner_selection_ignores_unknown_names(names):
    with _scanner_selection(",".join(list(names) + ["not-a-scanner"])):
        assert modelscan_audit._enabled_scanners() == names


# ── npm-audit: lock file line lookup ─────────────────────────────────────────

lock_lines = st.lists(
    st.text(alphabet=string.ascii_letters + string.digits + "_-:", min_size=0, max_size=20),
    min_size=0,
    max_size=10,
)


@given(prefix=lock_lines, node=identifier, suffix=lock_lines)
def test_lock_file_line_points_past_the_entry(prefix, node, suffix):
    lines = prefix + [f'"{node}": {{'] + suffix
    assert npm_audit.find_lock_file_line(lines, node) == len(prefix) + 2


# ── pip-audit: requirements install commands ─────────────────────────────────

requirement_lines = st.lists(
    identifier.filter(lambda s: "\\" not in s),
    min_size=1,
    max_size=15,
    unique=True,
)


@settings(max_examples=50)
@given(lines=requirement_lines)
def test_requirements_full_scan_yields_every_line(lines):
    result = list(pip_audit.install_commands_for_requirements_txt(lines, set(lines)))
    assert result == [([line], index + 1) for index, line in enumerate(lines)]


@settings(max_examples=50)
@given(lines=requirement_lines, changed=st.sets(st.integers(min_value=0)))
def test_requirements_scan_respects_the_diff(lines, changed):
    changed_positions = {i % len(lines) for i in changed}
    diff = {lines[i] for i in changed_positions}
    result = list(pip_audit.install_commands_for_requirements_txt(lines, diff))
    expected = [([lines[i]], i + 1) for i in sorted(changed_positions)]
    assert result == expected


# ── pip-audit: requirements index options ───────────────────────────────────

index_option_name = st.sampled_from(["--index-url", "-i", "--extra-index-url"])
index_option_url = st.sampled_from(["https://a.example/simple", "https://b.example/simple"])


@settings(max_examples=50)
@given(options=st.lists(st.tuples(index_option_name, index_option_url), max_size=12))
def test_index_options_last_index_wins_and_extras_dedupe(options):
    lines = [f"{opt} {url}" for opt, url in options]
    result_index, result_extras = pip_audit.index_options_from_requirements(lines)
    expected_index = next(
        (url for opt, url in reversed(options) if opt != "--extra-index-url"), None
    )
    expected_extras = []
    for opt, url in options:
        if opt == "--extra-index-url" and url not in expected_extras:
            expected_extras.append(url)
    assert result_index == expected_index
    assert result_extras == expected_extras


# ── pip-audit: pyproject uv index options ────────────────────────────────────

uv_index_name = st.from_regex(r"[a-z][a-z0-9-]{0,10}", fullmatch=True)
uv_index_url = st.sampled_from(["https://a.example/simple", "https://b.example/simple"])
uv_package = st.from_regex(r"[a-zA-Z][a-zA-Z0-9_-]{0,10}", fullmatch=True)


@st.composite
def uv_pyproject_data(draw):
    names = draw(st.lists(uv_index_name, min_size=0, max_size=4, unique=True))
    urls = [f"https://{name}.example/simple" for name in names]
    indexes = [
        {"name": name, "url": url, "explicit": True}
        for name, url in zip(names, urls)
    ]
    default_pos = st.integers(min_value=0, max_value=max(len(names) - 1, 0)) if names else st.none()
    if (pos := draw(default_pos)) is not None:
        indexes[pos]["default"] = True
    known = {name: i for i, name in enumerate(names)}
    # Sources either reference a known index or a bogus one
    source_names = [draw(st.sampled_from(names + ["bogus-index"])) for _ in range(2)]
    sources = {
        f"pkg-{i}": {"index": name} for i, name in enumerate(source_names)
    }
    return {
        "tool": {"uv": {"index": indexes, "sources": sources}},
        "urls": dict(zip(names, urls)),
        "default": urls[pos] if names and pos is not None and pos < len(names) else None,
        "source_names": source_names,
    }


@settings(max_examples=50)
@given(bundle=uv_pyproject_data())
def test_uv_indexes_resolve_only_named_sources(bundle):
    default_url, pkg_indexes = pip_audit.uv_index_options_from_pyproject(bundle)
    assert default_url == bundle["default"]
    # Sources pointing at unknown indexes never leak a URL, and every
    # resolved package is keyed by its canonical name
    for pkg, index_url_value in pkg_indexes.items():
        assert index_url_value in bundle["urls"].values()
        assert pkg == pip_audit.canonicalize_name(pkg)
    for source_name in bundle["source_names"]:
        if source_name not in bundle["urls"]:
            for pkg, name in bundle["tool"]["uv"]["sources"].items():
                if name == source_name:
                    assert pip_audit.canonicalize_name(pkg) not in pkg_indexes


@settings(max_examples=50)
@given(
    name=st.from_regex(r"[A-Za-z](?:[A-Za-z0-9._-]{0,10}[A-Za-z0-9])?", fullmatch=True),
    spec=st.from_regex(r"(?:(?:[<>=!~;,*]|\[)[<>=!~;,\[\]a-zA-Z0-9. -*]{0,14})?", fullmatch=True),
)
def test_requirement_name_canonicalizes_the_project_name(name, spec):
    requirement = name + spec
    expected = re.sub(r"[-_.]+", "-", name).lower()
    assert pip_audit.requirement_name(requirement) == expected


# ── scripttagextractor ───────────────────────────────────────────────────────

dependency = st.text(
    alphabet=string.ascii_letters + string.digits + "-_.>=<",
    min_size=1,
    max_size=12,
).filter(lambda s: not any(s.startswith(p) for p in ("-", ".", "/", ">=", "<")))


@settings(max_examples=50)
@given(deps=st.lists(dependency, min_size=1, max_size=8, unique=True))
def test_pyproject_full_scan_yields_each_dependency_once(deps):
    lines = ["[project]", "dependencies = ["] + [f'  "{d}",' for d in deps] + ["]"]
    result = list(pip_audit.install_commands_for_pyproject_toml(lines, set(lines)))
    assert sorted(cmd[0] for cmd, _ in result) == sorted(deps)
    assert len(result) == len(deps)


# ── pip-audit: pyproject uv index options ────────────────────────────────────

index_name = st.from_regex(r"[a-z][a-z0-9-]{0,10}", fullmatch=True)
index_url = st.sampled_from(["https://a.example/simple", "https://b.example/simple"])


@settings(max_examples=50)
@given(
    names=st.lists(index_name, min_size=0, max_size=4, unique=True),
    default_pos=st.one_of(st.none(), st.integers(min_value=0, max_value=3)),
    url_for=st.booleans(),
)
def test_uv_indexes_default_and_named_urls_are_collected(names, default_pos, url_for):
    indexes = []
    default_url = None
    for pos, name in enumerate(names):
        url = index_url.example if False else "https://x.example/simple"
        if url_for:
            url = f"https://{name}.example/simple"
        if default_pos is not None and pos == default_pos if (pos := len(indexes)) else False:
            pass
        indexes.append({"name": name, "url": f"https://{name}.example/simple"})
    if default_pos is not None and default_pos < len(names):
        indexes[default_pos]["default"] = True
    data = {"tool": {"uv": {"index": indexes}}}
    result_default, pkg_indexes = pip_audit.uv_index_options_from_pyproject({"tool": {"uv": {}}})
    result_default, pkg_indexes = pip_audit.uv_index_options_from_pyproject(
        {"tool": {"uv": {"index": indexes, "sources": {}}}}
    )
    expected_default = indexes[default_pos]["url"] if default_pos is not None and default_pos < len(names) else None
    assert result_default == expected_default if False else result_default == expected_default


def _uv_index_options_from_pyproject(data):
    return pip_audit.uv_index_options_from_pyproject(data)


# ── scripttagextractor ───────────────────────────────────────────────────────

script_data = st.text(alphabet=string.ascii_letters + string.digits + "\n;= ()", min_size=0, max_size=50)


@given(data=script_data)
def test_found_script_new_lines_counts_newlines(data):
    assert scripttagextractor.FoundScript(1, 0, data).new_lines() == data.count("\n")


html_text = st.text(alphabet=string.ascii_letters + " \n", min_size=0, max_size=30)


@settings(max_examples=50)
@given(text=html_text)
def test_parser_only_reports_script_data(text):
    document = f"<script>{text}</script>"
    parser = scripttagextractor.MyHTMLParser()
    parser.feed(document)
    joined = "".join(s.data for s in parser.scripts)
    assert joined == text


# ── scripttagextractor: stale paths ──────────────────────────────────────────

# Relative paths that cannot escape a temporary workspace
missing_path = st.text(
    alphabet=string.ascii_letters + string.digits + "-_/",
    min_size=1,
    max_size=30,
).filter(lambda s: not s.startswith("/") and ".." not in s.split("/"))


@settings(max_examples=50)
@given(paths=st.lists(missing_path, min_size=0, max_size=8, unique=True))
def test_main_skips_stale_paths_without_raising(paths):
    import tempfile

    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        source = root / "page.html"
        source.write_text("<html><script>a</script></html>")
        for stale in paths:
            scripttagextractor.main(str(root / stale), ".extractedscript.js", None)
        # Stale paths never abort the run: the real file still extracts
        scripttagextractor.main(str(source), ".extractedscript.js", None)
        assert (root / "page.html.extractedscript.js").read_text() == "; a"
