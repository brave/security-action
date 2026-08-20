#!/usr/bin/env python3
"""Unit tests for modelscan-audit.py — run directly: python3 assets/modelscan-audit.test.py"""
import importlib.util
import io
import json
import os
import tempfile
import unittest
from contextlib import redirect_stderr, redirect_stdout
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

_DIR = Path(__file__).resolve().parent
_SPEC = importlib.util.spec_from_file_location("modelscan_audit", _DIR / "modelscan-audit.py")
assert _SPEC is not None and _SPEC.loader is not None
audit = importlib.util.module_from_spec(_SPEC)
_SPEC.loader.exec_module(audit)


def _write(path, data):
    path.write_bytes(data)
    return str(path)


def _files_list(directory, paths):
    path = Path(directory) / "all_changed_files.txt"
    path.write_text("\0".join(paths) + "\0")
    return str(path)


class _Severity:
    def __init__(self, name):
        self.name = name


def _issue(severity="HIGH", **details):
    return SimpleNamespace(severity=_Severity(severity), details=SimpleNamespace(**details))


class TestEnabledScanners(unittest.TestCase):
    def test_unset_defaults_to_all(self):
        with patch.dict(os.environ):
            os.environ.pop("MODELSCAN_ENABLED_SCANNERS", None)
            self.assertEqual(audit._enabled_scanners(), set(audit.ALL_SCANNERS))

    def test_explicit_all(self):
        with patch.dict(os.environ, {"MODELSCAN_ENABLED_SCANNERS": "all"}):
            self.assertEqual(audit._enabled_scanners(), set(audit.ALL_SCANNERS))

    def test_false_or_empty_disables(self):
        for value in ("false", " FALSE ", ""):
            with patch.dict(os.environ, {"MODELSCAN_ENABLED_SCANNERS": value}):
                self.assertEqual(audit._enabled_scanners(), set(), value)

    def test_explicit_list_normalizes(self):
        with patch.dict(os.environ, {"MODELSCAN_ENABLED_SCANNERS": " Pickle , pytorch "}):
            self.assertEqual(audit._enabled_scanners(), {"pickle", "pytorch"})

    def test_unknown_scanners_warned_and_ignored(self):
        err = io.StringIO()
        with patch.dict(os.environ, {"MODELSCAN_ENABLED_SCANNERS": "pickle,bogus"}):
            with redirect_stderr(err):
                enabled = audit._enabled_scanners()
        self.assertEqual(enabled, {"pickle"})
        self.assertIn("bogus", err.getvalue())


class TestIdentifyFile(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.dir = Path(tmp.name)

    def test_pickle_protocol_2(self):
        p = _write(self.dir / "m.pkl", b"\x80\x02}q\x00.")
        self.assertEqual(audit._identify_file(p), ("pickle", False))

    def test_numpy(self):
        p = _write(self.dir / "m.npy", b"\x93NUMPY\x01\x00\x76\x08")
        self.assertEqual(audit._identify_file(p), ("numpy", False))

    def test_pytorch_zip(self):
        p = _write(self.dir / "m.bin", b"PK\x03\x04data/archive.pkl")
        self.assertEqual(audit._identify_file(p), ("pytorch", False))

    def test_h5(self):
        p = _write(self.dir / "m.h5", b"\x89HDF\r\n\x1a\n\x00\x00")
        self.assertEqual(audit._identify_file(p), ("h5", True))

    def test_keras_suffix(self):
        p = _write(self.dir / "m.keras", b"\x89HDF\r\n\x1a\n\x00\x00")
        self.assertEqual(audit._identify_file(p), ("keras", True))

    def test_pb_suffix(self):
        p = _write(self.dir / "m.pb", b"\x00\x00\x00\x10whatever")
        self.assertEqual(audit._identify_file(p), ("saved_model", True))

    def test_unknown_content(self):
        p = _write(self.dir / "m.txt", b"hello world")
        self.assertEqual(audit._identify_file(p), (None, False))

    def test_pickle_magic_without_protocol_byte(self):
        p = _write(self.dir / "m.pkl", b"\x80\xffjunk")
        self.assertEqual(audit._identify_file(p), (None, False))

    def test_truncated_pickle_magic(self):
        p = _write(self.dir / "m.pkl", b"\x80")
        self.assertEqual(audit._identify_file(p), (None, False))

    def test_missing_file(self):
        self.assertEqual(audit._identify_file(str(self.dir / "nope.bin")), (None, False))


class TestEmitIssue(unittest.TestCase):
    def test_emits_json_line(self):
        issue = _issue(
            description="eval call", module="__builtin__",
            operator="eval", scanner="pickle"
        )
        out = io.StringIO()
        with redirect_stdout(out):
            audit._emit_issue("m.pkl", issue)
        self.assertEqual(json.loads(out.getvalue()), {
            "path": "m.pkl", "severity": "HIGH", "description": "eval call",
            "module": "__builtin__", "operator": "eval", "scanner": "pickle"
        })

    def test_output_json_preferred(self):
        details = SimpleNamespace(
            description="stale", module="stale", operator="stale", scanner="stale",
            output_json=lambda: {
                "description": "fresh", "module": "os",
                "operator": "system", "scanner": "pytorch"
            }
        )
        out = io.StringIO()
        with redirect_stdout(out):
            audit._emit_issue("m.bin", SimpleNamespace(severity=_Severity("CRITICAL"), details=details))
        payload = json.loads(out.getvalue())
        self.assertEqual(payload["description"], "fresh")
        self.assertEqual(payload["module"], "os")
        self.assertEqual(payload["scanner"], "pytorch")
        self.assertEqual(payload["severity"], "CRITICAL")


class TestMain(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.dir = Path(tmp.name)

    def test_missing_files_list_exits_1(self):
        with patch.dict(os.environ, {"SCRIPTPATH": str(self.dir)}):
            with redirect_stderr(io.StringIO()):
                with self.assertRaises(SystemExit) as cm:
                    audit.main()
        self.assertEqual(cm.exception.code, 1)

    def test_disabled_scanners_exit_cleanly(self):
        _write(self.dir / "all_changed_files.txt", b"m.pkl\0")
        with patch.dict(os.environ, {
            "SCRIPTPATH": str(self.dir), "MODELSCAN_ENABLED_SCANNERS": "false"
        }):
            out = io.StringIO()
            with redirect_stdout(out):
                audit.main()
        self.assertEqual(out.getvalue(), "")

    def test_scans_and_emits_findings(self):
        p = _write(self.dir / "bad.pkl", b"\x80\x02}q\x00.")
        _files_list(self.dir, [p])

        def fake_scan(path):
            self.assertEqual(path, p)
            return SimpleNamespace(issues=[_issue(
                description="eval", module="__builtin__",
                operator="eval", scanner="pickle"
            )])

        with patch.dict(audit.SCAN_DISPATCH, {"pickle": fake_scan}):
            with patch.dict(os.environ, {
                "SCRIPTPATH": str(self.dir), "MODELSCAN_ENABLED_SCANNERS": "pickle"
            }):
                out = io.StringIO()
                with redirect_stdout(out):
                    audit.main()
        payload = json.loads(out.getvalue().strip())
        self.assertEqual(payload["path"], p)
        self.assertEqual(payload["severity"], "HIGH")

    def test_disabled_scanner_for_file_skips_scan(self):
        p = _write(self.dir / "m.h5", b"\x89HDF\r\n\x1a\n\x00\x00")
        _files_list(self.dir, [p])

        def boom(path):
            raise AssertionError("h5 scanner must not run")

        with patch.dict(audit.SCAN_DISPATCH, {"h5": boom}):
            with patch.dict(os.environ, {
                "SCRIPTPATH": str(self.dir), "MODELSCAN_ENABLED_SCANNERS": "pickle"
            }):
                out = io.StringIO()
                with redirect_stdout(out):
                    audit.main()
        self.assertEqual(out.getvalue(), "")

    def test_scan_exception_logged_and_skipped(self):
        p = _write(self.dir / "bad.pkl", b"\x80\x02}q\x00.")
        _files_list(self.dir, [p])

        def broken_scan(path):
            raise RuntimeError("boom")

        with patch.dict(audit.SCAN_DISPATCH, {"pickle": broken_scan}):
            with patch.dict(os.environ, {
                "SCRIPTPATH": str(self.dir), "MODELSCAN_ENABLED_SCANNERS": "pickle"
            }):
                out, err = io.StringIO(), io.StringIO()
                with redirect_stdout(out), redirect_stderr(err):
                    audit.main()
        self.assertEqual(out.getvalue(), "")
        self.assertIn("boom", err.getvalue())

    def test_missing_scriptpath_falls_back_to_script_dir(self):
        _files_list(self.dir, ["m.pkl"])
        with patch.dict(os.environ, {"MODELSCAN_ENABLED_SCANNERS": "false"}):
            os.environ.pop("SCRIPTPATH", None)
            with patch.object(audit, "__file__", str(self.dir / "modelscan-audit.py")):
                out = io.StringIO()
                with redirect_stdout(out):
                    audit.main()
        self.assertEqual(out.getvalue(), "")


if __name__ == "__main__":
    unittest.main(verbosity=2)
