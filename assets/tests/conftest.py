"""Shared fixtures for the Python scanner BDD suites.

Scanner scripts live directly under assets/ and use hyphenated filenames,
so they are loaded via importlib instead of normal imports.
"""
import importlib.util
from pathlib import Path

import pytest

ASSETS = Path(__file__).resolve().parent.parent


def _load_module(name, filename):
    spec = importlib.util.spec_from_file_location(name, ASSETS / filename)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


@pytest.fixture
def modelscan_audit():
    return _load_module("modelscan_audit_under_test", "modelscan-audit.py")


@pytest.fixture
def npm_audit():
    return _load_module("npm_audit_under_test", "npm-audit.py")


@pytest.fixture
def pip_audit():
    return _load_module("pip_audit_under_test", "pip-audit.py")


@pytest.fixture
def scripttagextractor():
    return _load_module("scripttagextractor_under_test", "scripttagextractor.py")


@pytest.fixture
def context():
    """Mutable state shared between Given/When/Then steps of a scenario."""
    return {}
