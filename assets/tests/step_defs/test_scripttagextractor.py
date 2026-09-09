"""pytest-bdd steps for scripttagextractor.feature"""
import io
import subprocess
import sys

from pytest_bdd import given, when, then, scenarios, parsers


scenarios("../features/scripttagextractor.feature")


# ── fixtures ─────────────────────────────────────────────────────────────────

@given("an HTML document")
def html_document(tmp_path, context, docstring):
    source = tmp_path / "page.html"
    source.write_text(docstring)
    context["source_file"] = str(source)


@given("a found script with the data")
def found_script(scripttagextractor, context, docstring):
    context["found_script"] = scripttagextractor.FoundScript(1, 0, docstring)


# ── parsing ──────────────────────────────────────────────────────────────────

@when("the document is parsed")
def document_parsed(scripttagextractor, context):
    parser = scripttagextractor.MyHTMLParser()
    with open(context["source_file"]) as f:
        parser.feed(f.read())
    context["scripts"] = parser.scripts


@then(parsers.parse("one script is found at line {line:d}"))
def one_script_at_line(context, line):
    assert len(context["scripts"]) == 1
    assert context["scripts"][0].line_number == line


@then("no script is found")
def no_script_found(context):
    assert context["scripts"] == []


@then(parsers.parse('the script data contains "{text}"'))
def script_data_contains(context, text):
    assert text in context["scripts"][0].data


@then(parsers.parse("the script spans {count:d} new lines"))
def script_spans_new_lines(context, count):
    assert context["found_script"].new_lines() == count


# ── extraction ───────────────────────────────────────────────────────────────

@when("the scripts are extracted")
def scripts_extracted(scripttagextractor, context):
    scripttagextractor.main(context["source_file"], ".extractedscript.js", None)


@when(parsers.parse('the scripts are extracted with the original copied to "{suffix}"'))
def scripts_extracted_with_copy(scripttagextractor, context, suffix):
    scripttagextractor.main(context["source_file"], ".extractedscript.js", suffix)


@when("a dry run extracts the scripts")
def scripts_extracted_dry(scripttagextractor, context):
    scripttagextractor.main(context["source_file"], ".extractedscript.js", None, dry_run=True)


@then(parsers.parse('the extracted file "{name}" contains exactly'))
def extracted_file_contains(tmp_path, context, name, docstring):
    content = (tmp_path / name).read_text()
    assert content == docstring


@then(parsers.parse('the copied file "{name}" contains exactly'))
def copied_file_contains(tmp_path, context, name, docstring):
    content = (tmp_path / name).read_text()
    assert content == docstring


@then(parsers.parse('the extracted file "{name}" does not exist'))
def extracted_file_absent(tmp_path, name):
    assert not (tmp_path / name).exists()


@then(parsers.parse('nothing is written to "{name}"'))
def nothing_written(tmp_path, name):
    assert not (tmp_path / name).exists()


# ── missing files ────────────────────────────────────────────────────────────

@when(parsers.parse('a missing file "{name}" is processed'))
def missing_file_processed(scripttagextractor, tmp_path, context, monkeypatch, name):
    # The module binds `stderr` at import time, so capsys cannot see it;
    # swap the module attribute instead.
    buffer = io.StringIO()
    monkeypatch.setattr(scripttagextractor, "stderr", buffer)
    scripttagextractor.main(str(tmp_path / name), ".extractedscript.js", None)
    context["stderr"] = buffer.getvalue()


@when(parsers.parse('the extractor runs over "{file_list}"'))
def extractor_runs(scripttagextractor, tmp_path, context, file_list):
    proc = subprocess.run(
        [sys.executable, scripttagextractor.__file__, *file_list.split(","),
         "--suffix", ".extractedscript.js", "--ignore-no-files"],
        capture_output=True, text=True, cwd=tmp_path, check=False,
    )
    context["returncode"] = proc.returncode
    context["stderr"] = proc.stderr


@then("the extractor exits successfully")
def extractor_exits_successfully(context):
    assert context["returncode"] == 0


@then(parsers.parse('a warning mentions "{text}"'))
def warning_mentions(context, text):
    assert text in context["stderr"]
