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
import struct
import sys
import zipfile
from pathlib import Path

ALL_SCANNERS = ("pickle", "numpy", "pytorch", "h5", "keras", "saved_model")

PICKLE_MAGIC = b"\x80"
NUMPY_MAGIC = b"\x93NUMPY"
ZIP_MAGIC = b"PK\x03\x04"
H5_MAGIC = b"\x89HDF\r\n\x1a\n"


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


def _identify_file(filepath):
    """Return (scanner_name, is_heavyweight) or (None, False)."""
    suffix = Path(filepath).suffix.lower()

    if suffix in (".keras",):
        return ("keras", True)
    if suffix in (".pb",):
        return ("saved_model", True)

    header = _read_magic(filepath, 8)
    if header is None:
        return (None, False)

    if header[:1] == PICKLE_MAGIC and header[1:2] in (
        b"\x00", b"\x01", b"\x02", b"\x03", b"\x04", b"\x05"
    ):
        return ("pickle", False)

    if header[:6] == NUMPY_MAGIC:
        return ("numpy", False)

    if header[:4] == ZIP_MAGIC:
        return ("pytorch", False)

    if header == H5_MAGIC:
        return ("h5", True)

    return (None, False)


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


def _scan_pickle_model(model_path):
    from modelscan.tools.picklescanner import scan_pickle_bytes
    from modelscan.settings import DEFAULT_SETTINGS, SupportedModelFormats
    from modelscan.model import Model

    model = Model(model_path)
    model.set_context("formats", [SupportedModelFormats.PICKLE.value])
    result = scan_pickle_bytes(model=model, settings=DEFAULT_SETTINGS)
    return result


def _scan_numpy_model(model_path):
    from modelscan.tools.picklescanner import scan_numpy
    from modelscan.settings import DEFAULT_SETTINGS, SupportedModelFormats
    from modelscan.model import Model

    model = Model(model_path)
    model.set_context("formats", [SupportedModelFormats.NUMPY.value])
    result = scan_numpy(model=model, settings=DEFAULT_SETTINGS)
    return result


def _scan_pytorch_model(model_path):
    from modelscan.tools.picklescanner import scan_pytorch
    from modelscan.settings import DEFAULT_SETTINGS, SupportedModelFormats
    from modelscan.model import Model

    model = Model(model_path)
    model.set_context("formats", [SupportedModelFormats.PYTORCH.value])
    result = scan_pytorch(model=model, settings=DEFAULT_SETTINGS)
    return result


def _scan_h5_model(model_path):
    from modelscan.settings import DEFAULT_SETTINGS
    from modelscan.model import Model
    from modelscan.model import Model as _Model

    try:
        from modelscan.scanners.h5.scan import H5LambdaDetectScan
    except ImportError:
        sys.stderr.write(
            f"ERROR: h5py not installed — cannot scan {model_path}\n"
        )
        return None

    model = _Model(model_path)
    scanner = H5LambdaDetectScan(DEFAULT_SETTINGS)
    try:
        result = scanner.scan(model)
    except Exception:
        result = None
    return result


def _scan_keras_model(model_path):
    from modelscan.settings import DEFAULT_SETTINGS
    from modelscan.model import Model

    try:
        from modelscan.scanners.keras.scan import KerasLambdaDetectScan
    except ImportError:
        sys.stderr.write(
            f"ERROR: tensorflow not installed — cannot scan {model_path}\n"
        )
        return None

    model = Model(model_path)
    scanner = KerasLambdaDetectScan(DEFAULT_SETTINGS)
    try:
        result = scanner.scan(model)
    except Exception:
        result = None
    return result


def _scan_saved_model(model_path):
    from modelscan.settings import DEFAULT_SETTINGS
    from modelscan.model import Model
    from importlib import import_module

    try:
        import_module("modelscan.scanners.saved_model.scan")
    except ImportError:
        sys.stderr.write(
            f"ERROR: tensorflow not installed — cannot scan {model_path}\n"
        )
        return None

    from modelscan.scanners.saved_model.scan import (
        SavedModelLambdaDetectScan,
        SavedModelTensorflowOpScan,
    )

    model = Model(model_path)
    results = []
    for scan_cls in (SavedModelLambdaDetectScan, SavedModelTensorflowOpScan):
        scanner = scan_cls(DEFAULT_SETTINGS)
        try:
            r = scanner.scan(model)
            if r and r.issues:
                results.append(r)
        except Exception:
            continue
    if not results:
        return None
    from modelscan.scanners.scan import ScanResults

    merged = ScanResults([], [])
    for r in results:
        if r.issues:
            merged.issues.extend(r.issues)
        if r.errors:
            merged.errors.extend(r.errors)
    return merged


SCAN_DISPATCH = {
    "pickle": _scan_pickle_model,
    "numpy": _scan_numpy_model,
    "pytorch": _scan_pytorch_model,
    "h5": _scan_h5_model,
    "keras": _scan_keras_model,
    "saved_model": _scan_saved_model,
}


def main():
    script_path = os.environ.get("SCRIPTPATH", "")
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

        scan_fn = SCAN_DISPATCH.get(name)
        if scan_fn is None:
            continue

        try:
            result = scan_fn(filepath)
        except Exception as e:
            sys.stderr.write(f"ERROR scanning {filepath}: {e}\n")
            continue

        if result is None or not result.issues:
            continue

        for issue in result.issues:
            _emit_issue(filepath, issue)


if __name__ == "__main__":
    main()
