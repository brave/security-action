#!/usr/bin/env python3
# ─────────────────────────────────────────────────────────────────────────────
# SCANNER ENABLE/DISABLE CONFIG
# ─────────────────────────────────────────────────────────────────────────────
# Controlled by env var MODELSCAN_ENABLED_SCANNERS (set by action.cjs from the
# GitHub Action input `modelscan_enabled`).
#
# Accepted values:
#   "all"                       → every scanner (default)
#   "pickle,numpy,pytorch"      → only those listed (comma-separated)
#   "" or "false"               → disable entirely (script exits 0, no output)
#
# Available scanners:
#   ── Lightweight (stdlib / numpy only) ────────────────────────────────────
#     pickle       .pkl .pickle .joblib .dill .dat .data   (stdlib, no extra dep)
#     numpy        .npy                                   (numpy ~30MB)
#     pytorch      .bin .pt .pth .ckpt                    (numpy ~30MB, zip+pickle)
#
#   ── Heavyweight (h5py / tensorflow) ─────────────────────────────────────
#   ↓↓↓ To disable: drop from modelscan_enabled AND remove the matching line ↓↓↓
#   ↓↓↓ from requirements.txt                                              ↓↓↓
#     h5           .h5                                     (h5py ~10MB)
#     keras        .keras                                  (tensorflow ~500MB)
#     saved_model  .pb                                     (tensorflow ~500MB)
# ─────────────────────────────────────────────────────────────────────────────

import json
import os
import sys
from pathlib import Path

ALL_SCANNERS = ("pickle", "numpy", "pytorch", "h5", "keras", "saved_model")

PICKLE_MAGIC = b"\x80"
PICKLE_PROTOCOLS = b"\x00\x01\x02\x03\x04\x05"
NUMPY_MAGIC = b"\x93NUMPY"
ZIP_MAGIC = b"PK\x03\x04"
H5_MAGIC = b"\x89HDF\r\n\x1a\n"

# Files identified purely by extension (magic bytes untrusted for these)
SUFFIX_SCANNERS = {".keras": "keras", ".pb": "saved_model"}


def _enabled_scanners():
    raw = os.environ.get("MODELSCAN_ENABLED_SCANNERS", "all").strip().lower()
    if not raw or raw == "false":
        return set()
    if raw == "all":
        return set(ALL_SCANNERS)
    requested = {s.strip() for s in raw.split(",")}
    invalid = requested - set(ALL_SCANNERS)
    if invalid:
        sys.stderr.write(
            f"WARNING: unknown scanners ignored: {sorted(invalid)}\n"
        )
    return requested & set(ALL_SCANNERS)


def _read_magic(filepath, n):
    try:
        with open(filepath, "rb") as f:
            return f.read(n)
    except OSError:
        return None


def _identify_magic(header):
    """Map magic bytes to (scanner_name, is_heavyweight) or (None, False)."""
    if header[:1] == PICKLE_MAGIC and header[1:2] and header[1:2] in PICKLE_PROTOCOLS:
        return ("pickle", False)
    if header[:6] == NUMPY_MAGIC:
        return ("numpy", False)
    if header[:4] == ZIP_MAGIC:
        return ("pytorch", False)
    if header == H5_MAGIC:
        return ("h5", True)
    return (None, False)


def _identify_file(filepath):
    """Return (scanner_name, is_heavyweight) or (None, False)."""
    suffix = Path(filepath).suffix.lower()
    if suffix in SUFFIX_SCANNERS:
        return (SUFFIX_SCANNERS[suffix], True)

    header = _read_magic(filepath, 8)
    if header is None:
        return (None, False)
    return _identify_magic(header)


def _emit_issue(path, issue):
    severity = issue.severity.name
    details = issue.details
    out = {
        "path": path,
        "severity": severity,
        "description": getattr(details, "description", ""),
        "module": getattr(details, "module", ""),
        "operator": getattr(details, "operator", ""),
        "scanner": getattr(details, "scanner", ""),
    }
    if hasattr(details, "output_json"):
        oj = details.output_json()
        out["description"] = oj.get("description", out["description"])
        out["module"] = oj.get("module", out["module"])
        out["operator"] = oj.get("operator", out["operator"])
        out["scanner"] = oj.get("scanner", out["scanner"])
    print(json.dumps(out))
    sys.stdout.flush()


def _scan_pickle_based(scan_fn_name, model_format):
    """pickle/numpy/pytorch share one flow: set format context, run scan fn."""
    def scan(model_path):
        from modelscan.settings import DEFAULT_SETTINGS, SupportedModelFormats
        from modelscan.model import Model
        from modelscan.tools import picklescanner

        model = Model(model_path)
        model.set_context("formats", [getattr(SupportedModelFormats, model_format).value])
        return getattr(picklescanner, scan_fn_name)(model=model, settings=DEFAULT_SETTINGS)
    return scan


def _import_h5_scan():
    from modelscan.scanners.h5.scan import H5LambdaDetectScan

    return H5LambdaDetectScan


def _import_keras_scan():
    from modelscan.scanners.keras.scan import KerasLambdaDetectScan

    return KerasLambdaDetectScan


def _scan_optional_dep(import_scanner, scanner_class_name, dep_name):
    """h5/keras share one flow: import optional-dep scanner, run, log errors.
    import_scanner is a zero-arg callable doing the static import — no
    importlib.import_module on computed strings (semgrep: non-literal-import)."""
    def scan(model_path):
        try:
            scanner_class = import_scanner()
        except ImportError:
            sys.stderr.write(
                f"ERROR: {dep_name} not installed — cannot scan {model_path}\n"
            )
            return None

        from modelscan.settings import DEFAULT_SETTINGS
        from modelscan.model import Model

        try:
            return scanner_class(DEFAULT_SETTINGS).scan(Model(model_path))
        except Exception as e:
            sys.stderr.write(
                f"ERROR scanning {model_path} with {scanner_class_name}: {e}\n"
            )
            return None
    return scan


def _scan_saved_model(model_path):
    try:
        from modelscan.scanners.saved_model.scan import (
            SavedModelLambdaDetectScan,
            SavedModelTensorflowOpScan,
        )
    except ImportError:
        sys.stderr.write(
            f"ERROR: tensorflow not installed — cannot scan {model_path}\n"
        )
        return None

    from modelscan.model import Model
    from modelscan.scanners.scan import ScanResults
    from modelscan.settings import DEFAULT_SETTINGS

    model = Model(model_path)
    merged = ScanResults([], [], [])
    for scanner_class in (SavedModelLambdaDetectScan, SavedModelTensorflowOpScan):
        try:
            result = scanner_class(DEFAULT_SETTINGS).scan(model)
        except Exception as e:
            sys.stderr.write(
                f"ERROR scanning {model_path} with {scanner_class.__name__}: {e}\n"
            )
            continue
        if result is None:
            continue
        merged.issues.extend(result.issues)
        merged.errors.extend(result.errors)
        merged.skipped.extend(result.skipped)
    return merged


SCAN_DISPATCH = {
    "pickle": _scan_pickle_based("scan_pickle_bytes", "PICKLE"),
    "numpy": _scan_pickle_based("scan_numpy", "NUMPY"),
    "pytorch": _scan_pickle_based("scan_pytorch", "PYTORCH"),
    "h5": _scan_optional_dep(_import_h5_scan, "H5LambdaDetectScan", "h5py"),
    "keras": _scan_optional_dep(_import_keras_scan, "KerasLambdaDetectScan", "tensorflow"),
    "saved_model": _scan_saved_model,
}


def main():
    # SCRIPTPATH convention shared with reviewdog.sh (assets dir, where
    # action.cjs writes all_changed_files.txt); fall back to this script's
    # own directory so standalone runs work without the env var.
    script_path = os.environ.get("SCRIPTPATH") or str(Path(__file__).resolve().parent)
    files_list = os.path.join(script_path, "all_changed_files.txt")
    if not os.path.exists(files_list):
        sys.stderr.write(f"File list not found: {files_list}\n")
        sys.exit(1)

    with open(files_list, "r") as f:
        raw = f.read()
    all_files = [p for p in raw.split("\0") if p.strip()]

    enabled = _enabled_scanners()
    if not enabled:
        return

    for filepath in all_files:
        name, heavy = _identify_file(filepath)
        if name is None or name not in enabled:
            continue

        try:
            result = SCAN_DISPATCH[name](filepath)
        except Exception as e:
            sys.stderr.write(f"ERROR scanning {filepath}: {e}\n")
            continue

        if result is None or not result.issues:
            continue

        for issue in result.issues:
            _emit_issue(filepath, issue)


if __name__ == "__main__":
    main()
