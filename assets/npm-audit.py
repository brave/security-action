import json
import subprocess

from os import environ, path


def main():
    with open(path.join(environ["SCRIPTPATH"], "all_changed_files.txt")) as all_changed_files:
        files = all_changed_files.read()
        changed_lock_files = [
            f for f in files.split("\x00")
            if f.endswith("package-lock.json")
        ]
    for lock_path in changed_lock_files:
        with open(lock_path) as lock_file:
            lock_file_lines = lock_file.readlines()
        cwd = path.split(lock_path)[0]
        stdout = subprocess.run(
            ["npm", "audit", "--package-lock-only", "--json"],
            cwd=cwd,
            capture_output=True,
        ).stdout
        output = json.loads(stdout)
        for vulnerability in output["vulnerabilities"].values():
            if not isinstance(vulnerability["via"][0], str):
                severity = vulnerability["severity"][0].upper()
                search_for = f'"{vulnerability["nodes"][0]}": {{'
                line = next(
                    lineno for lineno, line in enumerate(lock_file_lines)
                    if line.strip() == search_for
                ) + 2
                via = vulnerability["via"][0]
                source = via.get("url", "")
                if source:
                    source = f"<br /><br />See {source}"
                print(f"{severity}:{lock_path}:{line} {via.get('title')}{source}")


if __name__ == "__main__":
    main()