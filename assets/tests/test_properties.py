"""Hypothesis property tests for the Python scanner scripts."""
import contextlib
import importlib.util
import os
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


# ── pip-audit: pyproject install commands ────────────────────────────────────

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
