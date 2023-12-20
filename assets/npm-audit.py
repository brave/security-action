import json
import shutil
import subprocess
import sys
import tempfile

from os import environ, path


def main():
    with open(path.join(environ["SCRIPTPATH"], "all_changed_files.txt")) as all_changed_files:
        files = all_changed_files.read()
        changed_lock_files = [
            f for f in files.split("\x00")
            if f.endswith("package-lock.json")
        ]
    # Create temporary directory just for the package-lock.json file
    # without a parent directory containing package.json files
    with tempfile.TemporaryDirectory(dir="../") as temp_dir:
        temp_file_path = path.join(temp_dir, 'package-lock.json')
        for lock_path in changed_lock_files:
            with open(lock_path) as lock_file:
                lock_file_lines = lock_file.readlines()
            shutil.copy(lock_path, temp_file_path)
            process_output = subprocess.run(
                [shutil.which("npm"), "audit", "--package-lock-only", "--json"],
                cwd=temp_dir,
                capture_output=True,
            )
            output = json.loads(process_output.stdout)
            for vulnerability in output["vulnerabilities"].values():
                if not isinstance(vulnerability["via"][0], str):
                    severity = vulnerability["severity"][0].upper()
                    via = vulnerability["via"][0]
                    source = via.get("url", "")
                    node_name = vulnerability["nodes"][0]
                    search_for = f'"{node_name}": {{'
                    try:
                        line = next(
                            lineno for lineno, line in enumerate(lock_file_lines)
                            if line.strip() == search_for
                        ) + 2
                    except StopIteration:
                        if node_name.startswith("node_modules/"):
                            search_for = f'"{node_name[len("node_modules/"):]}": {{'
                            line = next(
                                lineno for lineno, line in enumerate(lock_file_lines)
                                if line.strip() == search_for
                            ) + 2
                        else:
                            print("Cannot find", search_for, vulnerability, file=sys.stderr)
                            raise
                    if source:
                        source = f"<br /><br />See {source}"
                    print(f"{severity}:{lock_path}:{line} {via.get('title')}{source}")


if __name__ == "__main__":
    main()
