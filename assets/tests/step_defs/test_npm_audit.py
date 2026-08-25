"""pytest-bdd steps for npm_audit.feature"""
import contextlib
import json
import re
import shutil
import subprocess

import pytest
from pytest_bdd import given, when, then, scenarios, parsers


@pytest.fixture(autouse=True)
def _activate_output_capture(capsys):
    """Start capture before any step runs — steps print via print()."""
    yield


scenarios("../features/npm_audit.feature")


def _capture(context, capsys):
    if "audit_out" not in context:
        captured = capsys.readouterr()
        context["audit_out"] = captured.out
        context["audit_err"] = captured.err


# ── lock file line lookup ────────────────────────────────────────────────────

@given("a lock file containing")
def lock_file(tmp_path, context, docstring):
    target = tmp_path / "package-lock.json"
    target.write_text(docstring + "\n")
    context["lock_path"] = str(target)


@then(parsers.parse('the line for "{node}" is {line:d}'))
def line_for(npm_audit, context, node, line):
    with open(context["lock_path"]) as f:
        lines = f.readlines()
    assert npm_audit.find_lock_file_line(lines, node) == line


@then(parsers.parse('looking up "{node}" raises StopIteration'))
def lookup_raises(npm_audit, context, node):
    with open(context["lock_path"]) as f:
        lines = f.readlines()
    with pytest.raises(StopIteration):
        npm_audit.find_lock_file_line(lines, node)


# ── audit report fixtures ────────────────────────────────────────────────────

@given("the changed files")
def changed_files(context, docstring):
    context.setdefault("changed_files", []).extend(docstring.splitlines())


@given("the lock file is among the changed files")
def lock_file_changed(context):
    context.setdefault("changed_files", []).append(context["lock_path"])


@given(parsers.parse('a "{severity}" vulnerability in "{node}" titled "{title}" with url "{url}"'))
def vulnerability_with_url(context, severity, node, title, url):
    context.setdefault("vulnerabilities", {})[node] = {
        "severity": severity,
        "via": [{"title": title, "url": url}],
        "nodes": [node],
    }


@given(parsers.parse('a "{severity}" vulnerability in "{node}" titled "{title}" without a url'))
def vulnerability_without_url(context, severity, node, title):
    context.setdefault("vulnerabilities", {})[node] = {
        "severity": severity,
        "via": [{"title": title}],
        "nodes": [node],
    }


@given(parsers.parse('a "{severity}" vulnerability in "{node}" reported via a string'))
def vulnerability_via_string(context, severity, node):
    context.setdefault("vulnerabilities", {})[node] = {
        "severity": severity,
        "via": ["lodash"],
        "nodes": [node],
    }


# ── run main with fakes ──────────────────────────────────────────────────────

@when("the audit runs")
def audit_runs(npm_audit, monkeypatch, tmp_path, context):
    script_dir = tmp_path / "scriptpath"
    script_dir.mkdir(exist_ok=True)
    changed = context.get("changed_files", [])
    (script_dir / "all_changed_files.txt").write_bytes("\x00".join(changed).encode())
    monkeypatch.setenv("SCRIPTPATH", str(script_dir))

    stdout = json.dumps({"vulnerabilities": context.get("vulnerabilities", {})}).encode()

    def fake_run(args, cwd=None, capture_output=False):
        return subprocess.CompletedProcess(args, 0, stdout=stdout, stderr=b"")

    @contextlib.contextmanager
    def fake_mkdtemp(dir=None):
        temp = tmp_path / "temp"
        temp.mkdir(exist_ok=True)
        yield str(temp)

    try:
        npm_audit.main(_run=fake_run, _which=lambda name: "npm", _mkdtemp=fake_mkdtemp, _copy=shutil.copy)
    except BaseException as exc:  # noqa: BLE001
        context["error"] = exc


# ── assertions ───────────────────────────────────────────────────────────────

@then("no vulnerability is reported")
def no_vulnerability_reported(context, capsys):
    _capture(context, capsys)
    assert context["audit_out"] == ""


@then("the output matches the finding pattern")
def output_matches_pattern(context, capsys, docstring):
    _capture(context, capsys)
    pattern = re.compile(docstring)
    assert any(pattern.fullmatch(line) for line in context["audit_out"].splitlines()), context["audit_out"]


@then("the audit aborts with StopIteration")
def audit_aborts(context):
    assert isinstance(context.get("error"), StopIteration)


@then(parsers.parse('stderr mentions the node "{node}"'))
def stderr_mentions_node(context, capsys, node):
    err = context.get("audit_err")
    if err is None:
        err = capsys.readouterr().err
    assert node in err
