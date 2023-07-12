import json
import subprocess

from collections.abc import Iterator
from os import environ, path

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
            if path.basename(f).startswith("requirements") and path.basename(f).endswith(".txt")
        ]

    index_url = environ.get("PYPI_INDEX_URL") or None
    extra_install_args = []
    if (trusted_hosts := environ.get("PYPI_INSECURE_HOSTS")):
        for host in trusted_hosts.split(","):
            extra_install_args.extend(["--trusted-host", host])

    for lock_path in changed_lock_files:
        for install_cmd, line_number in install_commands(lock_path):
            venv = VirtualEnv(install_cmd + extra_install_args, index_url=index_url)
            try:
                venv.create("./.venv-deleteme")
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
                venv.clear_directory("./.venv-deleteme")


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

    zero_indexed_lineno = 0
    while zero_indexed_lineno < len(lock_file_lines):
        line = lock_file_lines[zero_indexed_lineno]
        if line and line in diff_lines and not line.startswith(("#", "--", "-e ")):
            while line.endswith("\\"):
                zero_indexed_lineno += 1
                line = line[:-1].strip() + " " + lock_file_lines[zero_indexed_lineno]
            # There could be quoted or escaped spaces, but unlikely in 1st word.
            install_cmd = [line.strip().split(" ", 1)[0]]
            yield (install_cmd, zero_indexed_lineno + 1)
        zero_indexed_lineno += 1

if __name__ == "__main__":
    main()
