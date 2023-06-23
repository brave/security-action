import json
import subprocess

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
    for lock_path in changed_lock_files:
        with open(lock_path) as lock_file:
            lock_file_lines = [l.strip() for l in lock_file.readlines()]
        base_branch = f"origin/{environ.get('GITHUB_BASE_REF', 'main')}"
        diff_lines = {
            line[1:].strip()
            for line in
            subprocess.run(["git", "--no-pager", "diff", base_branch, "-U0", "--", lock_path], capture_output=True).stdout.decode().split("\n")
            if line.startswith("+") and not line.startswith("+++")
        }
        zero_indexed_lineno = 0
        while zero_indexed_lineno < len(lock_file_lines):
            line = lock_file_lines[zero_indexed_lineno]
            if line and line in diff_lines and not line.startswith(("#", "--", "-e ")):
                while line.endswith("\\"):
                    zero_indexed_lineno += 1
                    line = line[:-1].strip() + " " + lock_file_lines[zero_indexed_lineno]
                # There could be quoted or escaped spaces, but unlikely in 1st word.
                install_cmd = [line.strip().split(" ", 1)[0]]
                venv = VirtualEnv(install_cmd)
                try:
                    venv.create("./.venv-deleteme")
                except VirtualEnvError as e:
                    print(e)
                    zero_indexed_lineno += 1
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
                        print(f"M:{lock_path}:{zero_indexed_lineno + 1} {message}")
                except ReadTimeout as e:
                    print(e)
                    zero_indexed_lineno += 1
                    continue
                finally:
                    venv.clear_directory("./.venv-deleteme")
            zero_indexed_lineno += 1


if __name__ == "__main__":
    main()
