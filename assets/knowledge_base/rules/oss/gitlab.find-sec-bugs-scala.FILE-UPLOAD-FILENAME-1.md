---
name: oss/gitlab.find-sec-bugs-scala.FILE-UPLOAD-FILENAME-1
rubric: safety
severity: should_fix
languages: [scala]
---

**Rule.** The filename provided by the FileUpload API can be tampered with by the client to reference unauthorized files. The provided filename should be properly validated to ensure it's properly structured, contains no unauthorized path characters (e.g., / \), and refers to an authorized file.

**Why.** Reported as CWE-22. Ported from opengrep rule `gitlab.find_sec_bugs_scala.FILE_UPLOAD_FILENAME-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
def $FUNC (..., $REQ: HttpServletRequest, ... ) = {
  ...
  val $FILES = ($SFU: ServletFileUpload).parseRequest($REQ)
  ...
  for ($FILE <- $FILES.asScala) {
    ...
  }
}
$ITEM.getName()
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.FILE_UPLOAD_FILENAME-1` (metavariables start with `$`):

- `def $FUNC (..., $REQ: HttpServletRequest, ... ) = {
  ...
  val $FILES = ($SFU: ServletFileUpload).parseRequest($REQ)
  ...
  for ($FILE <- $FILES.asScala) {
    ...
  }
}`
- `$ITEM.getName()`
