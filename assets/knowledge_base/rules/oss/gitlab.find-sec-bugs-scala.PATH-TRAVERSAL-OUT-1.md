---
name: oss/gitlab.find-sec-bugs-scala.PATH-TRAVERSAL-OUT-1
rubric: safety
severity: should_fix
languages: [scala]
---

**Rule.** A file is opened to write to its contents. The filename comes from an input parameter. If an unfiltered parameter is passed to this file API, files at an arbitrary filesystem location could be modified. This rule identifies potential path traversal vulnerabilities. In many cases, the constructed file path cannot be controlled by the user.

**Why.** Reported as CWE-22. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs_scala.PATH_TRAVERSAL_OUT-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// untrusted input (source)
$ARGS[$IDX]
$VAR
// flows to sink without sanitization
$PATH
```

Good:

```text
org.apache.commons.io.FilenameUtils.getName(...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.PATH_TRAVERSAL_OUT-1` (metavariables start with `$`):

- `org.apache.commons.io.FilenameUtils.getName(...)`
- `new java.io.FileWriter($PATH, ...)`
- `$PATH`
- `new java.io.FileOutputStream($PATH, ...)`
- `def $FUNC(..., $ARGS: Array[String], ...): $TYPE = {
  ...
}`
- `$ARGS[$IDX]`
- `def $FUNC(..., $VAR: String, ...): $TYPE = {
  ...
}`
- `$VAR`
