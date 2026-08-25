"""CrossHair symbolic-verification contracts for the pure asset scanners.

Run via scripts/symbolic/run-crosshair.sh (external verification pass,
not a CI gate). Each function returns an invariant boolean with a PEP316
``post: __return__`` contract — CrossHair searches for an input that makes it
return False (or crash), which would mean a real bug in the scanner logic.

The asset modules have hyphenated filenames, so they are loaded through
importlib the same way as in assets/tests/conftest.py.
"""
import importlib.util
import tomllib
from pathlib import Path
from typing import List

ASSETS = Path(__file__).resolve().parent.parent.parent / 'assets'


def _load_module(name, filename):
    spec = importlib.util.spec_from_file_location(name, ASSETS / filename)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


npm_audit = _load_module('npm_audit', 'npm-audit.py')
pip_audit = _load_module('pip_audit', 'pip-audit.py')
scripttagextractor = _load_module('scripttagextractor', 'scripttagextractor.py')


def find_lock_file_line_is_in_bounds(lines: List[str], node_name: str) -> bool:
    """post: __return__"""
    try:
        result = npm_audit.find_lock_file_line(lines, node_name)
    except StopIteration:
        return True
    return 2 <= result <= len(lines) + 1


def requirements_install_commands_are_bounded(lines: List[str], diff_lines: List[str]) -> bool:
    """post: __return__"""
    if lines and lines[-1].endswith('\\'):
        # A trailing continuation line is malformed input outside the contract.
        return True
    last = 0
    for install_cmd, line_number in pip_audit.install_commands_for_requirements_txt(lines, diff_lines):
        if not (last < line_number <= len(lines)):
            return False
        last = line_number
        if len(install_cmd) != 1:
            return False
    return True


def pyproject_install_commands_are_bounded(lines: List[str], diff_lines: List[str]) -> bool:
    """post: __return__"""
    try:
        tomllib.loads('\n'.join(lines))
    except tomllib.TOMLDecodeError:
        # Unparseable TOML is outside the contract.
        return True
    last = 0
    seen = set()
    for install_cmd, line_number in pip_audit.install_commands_for_pyproject_toml(lines, diff_lines):
        if not (last < line_number <= len(lines)):
            return False
        last = line_number
        if len(install_cmd) != 1:
            return False
        if install_cmd[0] in seen:
            return False
        seen.add(install_cmd[0])
    return True


def found_script_new_lines_counts_newlines(data: str) -> bool:
    """post: __return__"""
    found = scripttagextractor.FoundScript(1, 0, data)
    return found.new_lines() == data.count('\n')


def parser_script_positions_are_ordered(text: str) -> bool:
    """post: __return__"""
    parser = scripttagextractor.MyHTMLParser()
    parser.feed(text)
    last = 1
    for found in parser.scripts:
        if found.line_number < last:
            return False
        last = found.line_number
        if found.start_offset < 0:
            return False
    return True
