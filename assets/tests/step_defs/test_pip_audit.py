"""pytest-bdd steps for pip_audit.feature"""
import json
import re
import subprocess
from types import SimpleNamespace

import pytest
from pytest_bdd import given, when, then, scenarios, parsers


@pytest.fixture(autouse=True)
def _activate_output_capture(capsys):
    """Start capture before any step runs — steps print via print()."""
    yield


scenarios("../features/pip_audit.feature")


def _capture(context, capsys):
    if "audit_out" not in context:
        captured = capsys.readouterr()
        context["audit_out"] = captured.out
        context["audit_err"] = captured.err


# ── lock file fixtures ───────────────────────────────────────────────────────

@given("a requirements file with the lines")
def requirements_lines(context, docstring):
    context["lock_lines"] = docstring.splitlines()
    context["lock_name"] = "requirements.txt"


@given("a pyproject file with the lines")
def pyproject_lines(context, docstring):
    context["lock_lines"] = docstring.splitlines()
    context["lock_name"] = "pyproject.toml"


@given("every line changed")
def every_line_changed(context):
    context["diff_lines"] = set(context["lock_lines"])


@given("the changed lines")
def changed_lines(context, datatable):
    context["diff_lines"] = {row[0] for row in datatable}


@given("the file is written to disk without a base ref")
def written_without_base_ref(tmp_path, context, monkeypatch):
    target = tmp_path / context["lock_name"]
    target.write_text("\n".join(context["lock_lines"]) + "\n")
    context["lock_path"] = str(target)
    monkeypatch.delenv("GITHUB_BASE_REF", raising=False)


@given(parsers.parse('the file is written to disk with base ref "{ref}" and the diff'))
def written_with_base_ref(tmp_path, context, monkeypatch, pip_audit, ref, docstring):
    target = tmp_path / context["lock_name"]
    target.write_text("\n".join(context["lock_lines"]) + "\n")
    context["lock_path"] = str(target)
    monkeypatch.setenv("GITHUB_BASE_REF", ref)

    def fake_run(args, capture_output=False):
        return subprocess.CompletedProcess(args, 0, stdout=docstring.encode(), stderr=b"")

    monkeypatch.setattr(pip_audit.subprocess, "run", fake_run)


# ── generator assertions ─────────────────────────────────────────────────────

@then("the install commands are")
def install_commands_are(pip_audit, context, datatable):
    expected = [row[0] for row in datatable]
    result = list(pip_audit.install_commands_for_requirements_txt(
        context["lock_lines"], context["diff_lines"]) if context["lock_name"] == "requirements.txt"
        else pip_audit.install_commands_for_pyproject_toml(context["lock_lines"], context["diff_lines"]))
    assert [cmd[0] for cmd, _ in result] == expected


@then("the install commands with line numbers are")
def install_commands_with_lines_are(pip_audit, context, datatable):
    expected = sorted((row[0], int(row[1])) for row in datatable)
    result = list(pip_audit.install_commands_for_requirements_txt(
        context["lock_lines"], context["diff_lines"]) if context["lock_name"] == "requirements.txt"
        else pip_audit.install_commands_for_pyproject_toml(context["lock_lines"], context["diff_lines"]))
    assert sorted((cmd[0], line) for cmd, line in result) == expected


@then("no install command is yielded")
def no_install_command(pip_audit, context):
    result = list(pip_audit.install_commands_for_requirements_txt(
        context["lock_lines"], context["diff_lines"]) if context["lock_name"] == "requirements.txt"
        else pip_audit.install_commands_for_pyproject_toml(context["lock_lines"], context["diff_lines"]))
    assert result == []


@then("the install commands from the file are")
def install_commands_from_file(pip_audit, context, datatable):
    expected = sorted((row[0], int(row[1])) for row in datatable)
    result = list(pip_audit.install_commands(context["lock_path"]))
    assert sorted((cmd[0], line) for cmd, line in result) == expected


# ── main() fixtures ──────────────────────────────────────────────────────────

@given("the changed files")
def changed_files(context, docstring):
    context.setdefault("changed_files", []).extend(docstring.splitlines())


@given("the file is among the changed files")
def file_among_changed(context):
    context.setdefault("changed_files", []).append(context["lock_path"])


@given(parsers.parse('the audit reports the vulnerability "{alias}" for "{name}" version "{version}"'))
def audit_reports_vulnerability(context, alias, name, version):
    context["audit_results"] = [(
        SimpleNamespace(name=name, version=version),
        [SimpleNamespace(aliases={alias}, id="PYSEC-0")],
    )]


@given(parsers.parse('the audit reports the id-only vulnerability "{vuln_id}" for "{name}" version "{version}"'))
def audit_reports_id_only(context, vuln_id, name, version):
    context["audit_results"] = [(
        SimpleNamespace(name=name, version=version),
        [SimpleNamespace(aliases=set(), id=vuln_id)],
    )]


@given("the audit reports no vulnerabilities")
def audit_reports_none(context):
    context["audit_results"] = []


@given(parsers.parse('the venv creation fails with "{message}"'))
def venv_creation_fails(context, message):
    context["venv_error"] = message


@given(parsers.parse('the audit times out with "{message}"'))
def audit_times_out(context, message):
    context["audit_timeout"] = message


@given(parsers.parse('the PyPI index "{index}" with insecure hosts "{hosts}"'))
def pypi_index(context, monkeypatch, index, hosts):
    monkeypatch.setenv("PYPI_INDEX_URL", index)
    monkeypatch.setenv("PYPI_INSECURE_HOSTS", hosts)


# ── run main with fakes ──────────────────────────────────────────────────────

@when("the audit runs")
def audit_runs(pip_audit, monkeypatch, tmp_path, context):
    script_dir = tmp_path / "scriptpath"
    script_dir.mkdir(exist_ok=True)
    changed = context.get("changed_files", [])
    (script_dir / "all_changed_files.txt").write_bytes("\x00".join(changed).encode())
    monkeypatch.setenv("SCRIPTPATH", str(script_dir))

    venvs = []

    class FakeVirtualEnv:
        def __init__(self, install_cmd, index_url=None):
            self.install_cmd = install_cmd
            self.index_url = index_url
            self.cleared = []
            venvs.append(self)

        def create(self, directory):
            if "venv_error" in context:
                raise pip_audit.VirtualEnvError(context["venv_error"])

        def clear_directory(self, directory):
            self.cleared.append(directory)

    class FakeAuditor:
        def __init__(self, service):
            self.service = service

        def audit(self, source):
            if "audit_timeout" in context:
                raise pip_audit.ReadTimeout(context["audit_timeout"])
            return context.get("audit_results", [])

    monkeypatch.setattr(pip_audit, "VirtualEnv", FakeVirtualEnv)
    monkeypatch.setattr(pip_audit, "Auditor", FakeAuditor)
    monkeypatch.setattr(pip_audit, "VulnerabilityServiceChoice",
                        SimpleNamespace(Pypi=SimpleNamespace(to_service=lambda t, s: "svc")))

    try:
        pip_audit.main()
    except BaseException as exc:  # noqa: BLE001
        context["error"] = exc
    context["venvs"] = venvs


# ── main() assertions ────────────────────────────────────────────────────────

@then("no finding is printed")
def no_finding_printed(context, capsys):
    _capture(context, capsys)
    assert not [line for line in context["audit_out"].splitlines() if line.startswith("M:")]


@then("the output matches the finding pattern")
def output_matches_pattern(context, capsys, docstring):
    _capture(context, capsys)
    pattern = re.compile(docstring)
    assert any(pattern.fullmatch(line) for line in context["audit_out"].splitlines()), context["audit_out"]


@then(parsers.parse('the venv failure "{message}" is printed'))
def venv_failure_printed(context, capsys, message):
    _capture(context, capsys)
    assert message in context["audit_out"]


@then(parsers.parse('the venv is created with install command "{command}" and index "{index}"'))
def venv_created_with(pip_audit, context, command, index):
    assert len(context["venvs"]) == 1
    venv = context["venvs"][0]
    assert venv.install_cmd == command.split(" ")
    assert venv.index_url == index
    assert venv.cleared == ["./.venv-deleteme"]
