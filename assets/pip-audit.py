import subprocess
import tomllib

from collections.abc import Iterator
from os import chdir, environ, getcwd, path

from pip_audit._audit import Auditor
from pip_audit._cli import VulnerabilityServiceChoice
from pip_audit._service.interface import ResolvedDependency
from pip_audit._virtual_env import VirtualEnv, VirtualEnvError

from requests.exceptions import ReadTimeout


class RequirementSource:
    def __init__(self, venv):
        self._venv = venv

    def collect(self):
        yield from (ResolvedDependency(*d) for d in self._venv.installed_packages)


def main():
    auditor = Auditor(VulnerabilityServiceChoice.Pypi.to_service(30, '.del'))
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
        install(lock_path, auditor, extra_install_args, index_url)


def install(lock_path, auditor, extra_install_args, index_url=None):
    install_commands_by_line = install_commands(lock_path)
    try:
        original_cwd = getcwd()
        tmpdir = path.join(original_cwd, "./.venv-deleteme")
        chdir(path.dirname(lock_path))
        for install_cmd, line_number in install_commands_by_line:
            venv = VirtualEnv(install_cmd + extra_install_args, index_url=index_url)
            try:
                venv.create(tmpdir)
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
                venv.clear_directory(tmpdir)
    finally:
        chdir(original_cwd)


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


def install_commands_for_requirements_txt(lock_file_lines: list[str], diff_lines: list[str]) -> Iterator[tuple[list[str], int]]:
    zero_indexed_lineno = 0
    while zero_indexed_lineno < len(lock_file_lines):
        line = lock_file_lines[zero_indexed_lineno]
        if line and line in diff_lines and not line.startswith(("#", "--")):
            while line.endswith("\\"):
                zero_indexed_lineno += 1
                line = line[:-1].strip() + " " + lock_file_lines[zero_indexed_lineno]
            # There could be quoted or escaped spaces, but unlikely to be affected.
            # Ignore --hash= and anything commented out but allow @ and ;sys_platform
            install_cmd = line.strip().split("#", 1)[0].split(" --", 1)[0].strip()
            if install_cmd.startswith("-e "):
                install_cmd = install_cmd[3:].strip()
            yield ([install_cmd], zero_indexed_lineno + 1)
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
