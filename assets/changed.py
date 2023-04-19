import re

from os import environ, path
from typing import Callable


def changed(filename_filter: Callable[[str], bool]):
    try:
        with open(path.join(environ["SCRIPTPATH"], "all_changed_files.txt")) as all_changed_files:
            files = all_changed_files.read()
            for f in sorted(files.split("\n")):
                if filename_filter(f):
                    yield f
    except FileNotFoundError:
        pass


def changed_by_suffix(suffix: str):
    yield from changed(lambda f: f.endswith(suffix))


def changed_by_regex(regex_str: str):
    r = re.compile(f"^({regex_str})$")
    yield from changed(lambda f: r.match(f) is not None)


def main():
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--status", action="store_true")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--suffix")
    group.add_argument("--regex")
    group.add_argument("--any", action="store_true")
    args = parser.parse_args()
    generator = (
        changed_by_suffix(args.suffix)
        if args.suffix is not None else
        changed_by_regex(args.regex)
        if args.regex else
        changed(lambda x: bool(x))
    )
    has_files = False
    for f in generator:
        has_files = True
        print(f)
    if args.status and not has_files:
        exit(1)


if __name__ == "__main__":
    main()