---
name: oss/gitlab.find-sec-bugs-kotlin.FILE-UPLOAD-FILENAME-1
rubric: safety
severity: should_fix
languages: [kotlin]
cwe: [CWE-22]
---

**Rule.** The filename provided by the FileUpload API can be tampered with by the client to reference unauthorized files. The provided filename should be properly validated to ensure it's properly structured, contains no unauthorized path characters (e.g., / \), and refers to an authorized file.

**Why.** Reported as CWE-22. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.FILE_UPLOAD_FILENAME-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.FILE_UPLOAD_FILENAME-1` (metavariables start with `$`):

- `$FILES = ($SFU: ServletFileUpload).parseRequest(($REQ: $X.servlet.http.HttpServletRequest?))
...
for($ITEM in $FILES) {
  ...
}`
- `$ITEM.getName()`
- `($PART: $X.servlet.http.Part).getSubmittedFileName()`
