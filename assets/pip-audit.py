import subprocess
import tomllib

from collections.abc import Iterator
from os import environ, path

from pip_audit._audit import Auditor
from pip_audit._service.interface import ResolvedDependency
from pip_audit._service.pypi import PyPIService
from pip_audit._virtual_env import VirtualEnv, VirtualEnvError

from requests.exceptions import ReadTimeout


class RequirementSource:
    def __init__(self, venv):
        self._venv = venv

    def collect(self):
        yield from (ResolvedDependency(*d) for d in self._venv.installed_packages)


def venv_base():
    """Base directory for the throwaway pip venv and PyPI HTTP cache.

    pip install runs arbitrary setup hooks from PR-controlled requirements, so
    the venv lives outside the workspace when the runner provides RUNNER_TEMP
    (the sandbox wrapper keeps the workspace read-only). PIP_AUDIT_VENV_BASE
    overrides both for tests and local runs. The HTTP cache lives here too:
    pip_audit fails the scan with cache-write warnings when its cache dir
    points into the read-only workspace.
    """
    return environ.get("PIP_AUDIT_VENV_BASE") or environ.get("RUNNER_TEMP") or "."


def main():
    auditor = Auditor(PyPIService(path.join(venv_base(), ".pip-audit-cache"), 30))
    venv_dir = path.join(venv_base(), ".venv-deleteme")
    with open(path.join(environ["SCRIPTPATH"], "all_changed_files.txt")) as all_changed_files:
        files = all_changed_files.read()
        changed_lock_files = [
            f for f in files.split("\x00")
            if (
                (path.basename(f).startswith("requirements") and path.basename(f).endswith(".txt")) or
                (path.basename(f) == "pyproject.toml")
            )
        ]

    index_url = environ.get("PYPI_INDEX_URL") or None
    extra_install_args = []
    if (trusted_hosts := environ.get("PYPI_INSECURE_HOSTS")):
        for host in trusted_hosts.split(","):
            extra_install_args.extend(["--trusted-host", host])

    for lock_path in changed_lock_files:
        file_index_url = None
        extra_index_urls = []
        if path.basename(lock_path) != "pyproject.toml":
            with open(lock_path) as lock_file:
                file_index_url, extra_index_urls = index_options_from_requirements(lock_file.readlines())
        # The env index wins; the file --index-url is a fallback for repos
        # hosting wheels on a private index (e.g. cu* torch builds).
        venv_index_url = index_url or file_index_url
        for install_cmd, line_number in install_commands(lock_path):
            venv = VirtualEnv(install_cmd + extra_install_args, index_url=venv_index_url, extra_index_urls=extra_index_urls)
            try:
                venv.create(venv_dir)
            except VirtualEnvError as e:
                print(e)
                continue
            deps = RequirementSource(venv)
            try:
                results = auditor.audit(deps)
                message = ""
                for (dependency, vulnerabilities) in results:
                    if vulnerabilities:
                        message += f"{dependency.name} {dependency.version}:<br>"
                        for i, vulnerability in enumerate(vulnerabilities):
                            message += f"{i+1}. {sorted(vulnerability.aliases)[0] if vulnerability.aliases else vulnerability.id}<br>"
                        message += "<br>"
                if message:
                    message = f"Requiring `{install_cmd[0]}` imports packages with known vulnerabilities:<br><br>{message}"
                    print(f"M:{lock_path}:{line_number} {message}")
            except ReadTimeout as e:
                print(e)
                continue
            finally:
                venv.clear_directory(venv_dir)


def install_commands(lock_path: str) -> Iterator[tuple[list[str], int]]:
    with open(lock_path) as lock_file:
        lock_file_lines = [l.strip() for l in lock_file.readlines()]
    if environ.get("GITHUB_BASE_REF") is not None:
        base_branch = f"origin/{environ['GITHUB_BASE_REF']}"
        diff_lines = {
            line[1:].strip()
            for line in
            subprocess.run(["git", "--no-pager", "diff", base_branch, "-U0", "--", lock_path], capture_output=True).stdout.decode().split("\n")
            if line.startswith("+") and not line.startswith("+++")
        }
    else:
        diff_lines = set(lock_file_lines)  # full scan on all lines

    if lock_path.endswith("pyproject.toml"):
        yield from install_commands_for_pyproject_toml(lock_file_lines, diff_lines)
    else:
        yield from install_commands_for_requirements_txt(lock_file_lines, diff_lines)


INDEX_URL_OPTIONS = {"--index-url", "-i"}
EXTRA_INDEX_URL_OPTIONS = {"--extra-index-url"}


def index_options_from_requirements(lock_file_lines: list[str]) -> tuple[str | None, list[str]]:
    """Harvest pip index options from requirements lines.

    Requirements files may carry `--index-url`/`-i` and
    `--extra-index-url` either as global option lines or inline after a
    requirement spec, in both `opt value` and `opt=value` forms. Pinned
    requirements with local version suffixes (e.g. torch==2.6.0+cu124)
    only resolve on those indexes, so the venv must inherit them.

    Returns (index_url, extra_index_urls): the last --index-url seen
    (None when absent) and every --extra-index-url deduplicated with
    first-seen order preserved.
    """
    index_url = None
    extra_index_urls = []
    for line in lock_file_lines:
        tokens = line.strip().split()
        i = 0
        while i < len(tokens):
            token = tokens[i]
            if token.startswith("#"):
                break  # rest of the line is a comment
            option, has_value, value = token.partition("=")
            if option in INDEX_URL_OPTIONS:
                if has_value:
                    index_url = value
                    i += 1
                elif i + 1 < len(tokens):
                    index_url = tokens[i + 1]
                    i += 2
                else:
                    i += 1
            elif option in EXTRA_INDEX_URL_OPTIONS:
                if has_value:
                    candidate, i = value, i + 1
                elif i + 1 < len(tokens):
                    candidate, i = tokens[i + 1], i + 2
                else:
                    i += 1
                    continue
                if candidate not in extra_index_urls:
                    extra_index_urls.append(candidate)
            else:
                i += 1
    return index_url, extra_index_urls


def install_commands_for_requirements_txt(lock_file_lines: list[str], diff_lines: list[str]) -> Iterator[tuple[list[str], int]]:
    zero_indexed_lineno = 0
    while zero_indexed_lineno < len(lock_file_lines):
        line = lock_file_lines[zero_indexed_lineno]
        # No PEP 508 requirement starts with "-", so this skips every
        # requirements-file option line (global or short form) too.
        if line and line in diff_lines and not line.startswith(("#", "-")):
            while line.endswith("\\"):
                zero_indexed_lineno += 1
                line = line[:-1].strip() + " " + lock_file_lines[zero_indexed_lineno]
            # There could be quoted or escaped spaces, but unlikely in 1st word.
            install_cmd = [line.strip().split(" ", 1)[0]]
            yield (install_cmd, zero_indexed_lineno + 1)
        zero_indexed_lineno += 1


def install_commands_for_pyproject_toml(lock_file_lines: list[str], diff_lines: list[str]) -> Iterator[tuple[list[str], int]]:
    KEYS_TO_WATCH = [
        # In future may want build or dev dependencies
        ('project', 'dependencies')
    ]

    # Read toml data properly
    toml_data = tomllib.loads("\n".join(lock_file_lines))
    declared_dependencies = {
        dependency
        for l in (
            toml_data.get(section, {}).get(key, []) for section, key in KEYS_TO_WATCH
        ) for dependency in l
    }
    if not declared_dependencies:
        return

    zero_indexed_lineno = 0
    while zero_indexed_lineno < len(lock_file_lines):
        line = lock_file_lines[zero_indexed_lineno]
        if line and line in diff_lines and not line.startswith(("#")):
            seen_dependencies = set()
            for dependency in declared_dependencies:
                # This is lazy but complexity should only be an issue in gigantic files
                if dependency in line:
                    seen_dependencies.add(dependency)
                    install_cmd = [dependency]
                    yield (install_cmd, zero_indexed_lineno + 1)
            declared_dependencies.difference_update(seen_dependencies)
        zero_indexed_lineno += 1


if __name__ == "__main__":
    main()
