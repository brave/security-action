from dataclasses import dataclass
from glob import glob
from html.parser import HTMLParser
from os import environ, path
from shutil import copyfile
from sys import stderr
from typing import List

class DontPrint(object):
    def write(*args): pass
out = DontPrint()

@dataclass
class FoundScript:
    line_number: int
    start_offset: int
    data: str

    def new_lines(self) -> int:
        return len(self.data.split("\n")) - 1


class MyHTMLParser(HTMLParser):
    def __init__(self, *, convert_charrefs: bool = True) -> None:
        super().__init__(convert_charrefs=convert_charrefs)
        self.current_tag = None
        self.scripts : List[FoundScript] = []

    def handle_starttag(self, tag, attrs):
        self.current_tag = tag.lower()

    def handle_endtag(self, tag: str) -> None:
        self.current_tag = None
        return super().handle_endtag(tag)

    def handle_data(self, data: str) -> None:
        if self.lasttag.lower() == "script" and self.current_tag == "script":
            self.scripts.append(FoundScript(self.lineno, self.offset, data))
        return super().handle_data(data)


def main(source_file, suffix, add_suffix_to_original, dry_run=False):
    parser = MyHTMLParser()
    with open(source_file) as original_file:
        original_file_data = original_file.read()
    parser.feed(original_file_data)

    if parser.scripts:
        current_line_number = 1
        script_data = ""
        for s in parser.scripts:
            add_lines = s.line_number - current_line_number
            script_data += "\n" * add_lines
            script_data += "; " + s.data
            current_line_number += add_lines + s.new_lines()

        output_file = f"{source_file}{suffix}"
        print("Extracting", source_file, "to", output_file, file=out)
        if not dry_run:
            with open(output_file, "w") as f:
                f.write(script_data)

    if add_suffix_to_original:
        destination = f"{source_file}{add_suffix_to_original}"
        print("Copying", source_file, destination, file=out)
        if not dry_run:
            copyfile(source_file, destination)


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(
        "Script tag extractor",
        description="Extracts content of <script> tags from HTML files such as .svelte so that semgrep will process the scripts",
    )
    parser.add_argument("--suffix", default=".extractedscript.js", help="Scripts are extracted into files with this suffix added to the original filename")
    parser.add_argument("--add-suffix-to-original", help="Copy original file and add this extension (probably .something.html)")
    parser.add_argument("--all-changed-files-suffix", help="Process files from all_changed_files.txt which have this suffix")
    parser.add_argument("--glob", help="Process files matching glob")
    parser.add_argument("--ignore-no-files", action="store_true", help="Don't fail if there are no matching files")
    parser.add_argument("--dry-run", action="store_true", help="Just print what this would output")
    parser.add_argument("--debug", action="store_true", help="Print debug information to stderr")
    parser.add_argument("files", nargs="*", help="Files to process")

    args = parser.parse_args()

    if args.debug:
        out = stderr

    files = []
    files.extend(args.files)

    if args.all_changed_files_suffix:
        with open(path.join(environ["SCRIPTPATH"], "all_changed_files.txt")) as all_changed_files:
            changed_files = all_changed_files.read()
            files.extend([
                f for f in changed_files.split("\x00")
                if f.endswith(args.all_changed_files_suffix)
            ])

    if args.glob:
        files.extend(glob(args.glob, recursive=True))

    files = [
        f for f in files
        if not f.endswith(args.suffix)
        and not (args.add_suffix_to_original and f.endswith(args.add_suffix_to_original))
    ]

    print("Files to process:", files, file=out)
    if not files and not args.ignore_no_files:
        print("No files to process")
        parser.print_help()
        parser.exit(1)

    for f in files:
        main(f, args.suffix, args.add_suffix_to_original, args.dry_run)
