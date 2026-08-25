"""pytest-bdd steps for modelscan_audit.feature"""
import json
import sys
from types import SimpleNamespace

import pytest
from pytest_bdd import given, when, then, scenarios, parsers


@pytest.fixture(autouse=True)
def _activate_output_capture(capsys):
    """Start capture before any step runs — steps print via print()."""
    yield


scenarios("../features/modelscan_audit.feature")

MAGIC_CONTENTS = {
    "pickle protocol": b"\x80\x02}q\x00.",
    "numpy": b"\x93NUMPY\x01\x00\x76\x08",
    "pytorch zip": b"PK\x03\x04data/archive.pkl",
    "h5": b"\x89HDF\r\n\x1a\n\x00\x00",
    "anything": b"\x00\x00\x00\x10whatever",
    "unknown": b"hello world",
    "bad pickle": b"\x80\xffjunk",
    "truncated pickle": b"\x80",
}


class _Severity:
    def __init__(self, name):
        self.name = name


def _issue(severity="HIGH", **details):
    return SimpleNamespace(severity=_Severity(severity), details=SimpleNamespace(**details))


# ── scanner selection ────────────────────────────────────────────────────────

@given("no scanner selection")
def no_scanner_selection(monkeypatch):
    monkeypatch.delenv("MODELSCAN_ENABLED_SCANNERS", raising=False)


@given(parsers.parse('the scanner selection "{selection}"'))
def scanner_selection(monkeypatch, selection):
    monkeypatch.setenv("MODELSCAN_ENABLED_SCANNERS", selection)


@given("the empty scanner selection")
def empty_scanner_selection(monkeypatch):
    monkeypatch.setenv("MODELSCAN_ENABLED_SCANNERS", "")


@then("every scanner is enabled")
def every_scanner_enabled(modelscan_audit):
    assert modelscan_audit._enabled_scanners() == set(modelscan_audit.ALL_SCANNERS)


@then("no scanner is enabled")
def no_scanner_enabled(modelscan_audit):
    assert modelscan_audit._enabled_scanners() == set()


@then(parsers.parse('the enabled scanners are "{expected}"'))
def enabled_scanners_are(modelscan_audit, expected):
    assert modelscan_audit._enabled_scanners() == set(expected.split(","))


@then(parsers.parse('a warning mentions "{text}"'))
def warning_mentions(capsys, text):
    assert text in capsys.readouterr().err


# ── file identification ──────────────────────────────────────────────────────

@given(parsers.parse('a model file "{filename}" with {magic} content'))
def model_file(modelscan_audit, tmp_path, context, filename, magic):
    target = tmp_path / filename
    target.write_bytes(MAGIC_CONTENTS[magic])
    context["script_dir"] = tmp_path
    context["identified"] = modelscan_audit._identify_file(str(target))


@when(parsers.parse('identifying the file "{filename}"'))
def identify_file(modelscan_audit, tmp_path, context, filename):
    context.setdefault("script_dir", tmp_path)
    context["identified"] = modelscan_audit._identify_file(str(context["script_dir"] / filename))


@then(parsers.parse('the file is identified as "{scanner}" with heavyweight "{heavy}"'))
def file_identified_as(context, scanner, heavy):
    expected = (scanner, heavy == "yes") if scanner != "nothing" else (None, False)
    assert context["identified"] == expected


# ── issue emission ───────────────────────────────────────────────────────────

@given(parsers.parse('an issue with severity "{severity}" and details "{details}"'))
def issue_with_details(context, severity, details):
    description, module, operator, scanner = details.split("|")
    context["issue"] = _issue(
        severity, description=description, module=module, operator=operator, scanner=scanner
    )


@given("an issue with output_json details")
def issue_with_output_json(context):
    details = SimpleNamespace(
        description="stale", module="stale", operator="stale", scanner="stale",
        output_json=lambda: {
            "description": "fresh", "module": "os",
            "operator": "system", "scanner": "pytorch",
        },
    )
    context["issue"] = SimpleNamespace(severity=_Severity("CRITICAL"), details=details)


@when(parsers.parse('emitting the issue for "{path}"'))
def emit_issue(modelscan_audit, context, path):
    modelscan_audit._emit_issue(path, context["issue"])


@then("the JSON output line is")
def json_output_line(capsys, docstring):
    assert capsys.readouterr().out.strip() == docstring.strip()


@then(parsers.parse('the JSON output has description "{description}" and severity "{severity}"'))
def json_output_fields(capsys, description, severity):
    payload = json.loads(capsys.readouterr().out.strip())
    assert payload["description"] == description
    assert payload["severity"] == severity


# ── optional dependency scanners ─────────────────────────────────────────────

@given("a scanner whose import fails with ImportError")
def scanner_import_fails(context):
    context["scanner"] = {"importer": lambda: (_ for _ in ()).throw(ImportError("no tensorflow"))}


@given("a scanner that raises while scanning")
def scanner_raises(context):
    class ExplodingScan:
        def __init__(self, settings):
            pass

        def scan(self, model):
            raise RuntimeError("boom")

    context["scanner"] = {"importer": lambda: ExplodingScan}


@given("a scanner that returns a result")
def scanner_returns(context):
    scan_result = object()

    class OkScan:
        def __init__(self, settings):
            pass

        def scan(self, model):
            return scan_result

    context["scanner"] = {"importer": lambda: OkScan, "result": scan_result}


@when(parsers.parse('scanning "{path}" with it'))
def scan_with_optional_dep(modelscan_audit, monkeypatch, context, path):
    scanner = context["scanner"]
    monkeypatch.setitem(sys.modules, "modelscan.settings", SimpleNamespace(DEFAULT_SETTINGS="S"))
    monkeypatch.setitem(sys.modules, "modelscan.model", SimpleNamespace(Model=lambda p: p))
    scan = modelscan_audit._scan_optional_dep(scanner["importer"], "Scan", "tensorflow")
    context["scan_result"] = scan(path)


@then("the scan result is none")
def scan_result_is_none(context):
    assert context["scan_result"] is None


@then("the scan result is the scanner result")
def scan_result_is_passed_through(context):
    assert context["scan_result"] is context["scanner"]["result"]


@then(parsers.parse('the error output mentions "{text}"'))
def error_output_mentions(capsys, context, text):
    err = context.get("audit_err")
    if err is None:
        err = capsys.readouterr().err
    assert text in err


# ── main flow ────────────────────────────────────────────────────────────────

def _write_file_list(tmp_path, entries):
    (tmp_path / "all_changed_files.txt").write_text("\0".join(entries) + "\0")


@given("a script directory without a file list")
def script_dir_without_file_list(tmp_path, context, monkeypatch):
    context["script_dir"] = tmp_path
    monkeypatch.setenv("SCRIPTPATH", str(tmp_path))


@given(parsers.parse('a file list with "{filename}"'))
def file_list_with_filename(tmp_path, context, monkeypatch, filename):
    _write_file_list(tmp_path, [filename])
    context["script_dir"] = tmp_path
    monkeypatch.setenv("SCRIPTPATH", str(tmp_path))


@given("a file list with a pickle file")
def file_list_with_pickle_file(tmp_path, context, monkeypatch):
    target = tmp_path / "bad.pkl"
    target.write_bytes(b"\x80\x02}q\x00.")
    _write_file_list(tmp_path, [str(target)])
    context["script_dir"] = tmp_path
    monkeypatch.setenv("SCRIPTPATH", str(tmp_path))
    context["scan_target"] = str(target)


@given("a file list with an h5 file")
def file_list_with_h5_file(tmp_path, context, monkeypatch):
    target = tmp_path / "m.h5"
    target.write_bytes(b"\x89HDF\r\n\x1a\n\x00\x00")
    _write_file_list(tmp_path, [str(target)])
    context["script_dir"] = tmp_path
    monkeypatch.setenv("SCRIPTPATH", str(tmp_path))


@given("the pickle scanner returns one issue")
def pickle_scanner_returns_issue(context):
    def fake_scan(path):
        assert path == context["scan_target"]
        return SimpleNamespace(issues=[_issue(
            description="eval", module="__builtin__", operator="eval", scanner="pickle"
        )])

    context["fake_scans"] = {"pickle": fake_scan}


@given("the h5 scanner must not run")
def h5_scanner_must_not_run(context):
    def boom(path):
        raise AssertionError("h5 scanner must not run")

    context["fake_scans"] = {"h5": boom}


@given(parsers.parse('the pickle scanner raises "{message}"'))
def pickle_scanner_raises(context, message):
    def broken_scan(path):
        raise RuntimeError(message)

    context["fake_scans"] = {"pickle": broken_scan}


@given("no SCRIPTPATH")
def no_scriptpath(monkeypatch, tmp_path, context):
    monkeypatch.delenv("SCRIPTPATH", raising=False)
    _write_file_list(tmp_path, ["m.pkl"])
    context["script_dir"] = tmp_path
    context["patch_script_file"] = True


@when("running the audit")
def run_audit(modelscan_audit, monkeypatch, context):
    fake_scans = context.get("fake_scans")
    if fake_scans:
        for name, scan in fake_scans.items():
            monkeypatch.setitem(modelscan_audit.SCAN_DISPATCH, name, scan)
    if context.get("patch_script_file"):
        monkeypatch.setattr(
            modelscan_audit, "__file__", str(context["script_dir"] / "modelscan-audit.py")
        )
    context["exit"] = None
    try:
        modelscan_audit.main()
    except SystemExit as e:
        context["exit"] = e.code


@then("the audit exits with status 1")
def audit_exits_1(context):
    assert context["exit"] == 1


@then("the audit output is empty")
def audit_output_empty(capsys, context):
    captured = capsys.readouterr()
    context["audit_err"] = captured.err
    assert captured.out == ""
