---
name: oss/gitlab.find-sec-bugs.PATH-TRAVERSAL-OUT-1.PATH-TRAVERSAL-OUT-1
rubric: safety
severity: should_fix
languages: [java]
cwe: [CWE-22]
---

**Rule.** A file is opened to write to its contents. The filename comes from an input parameter. If an unfiltered parameter is passed to this file API, files at an arbitrary filesystem location could be modified. This rule identifies potential path traversal vulnerabilities. In many cases, the constructed file path cannot be controlled by the user.

**Why.** Reported as CWE-22. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs.PATH_TRAVERSAL_OUT-1.PATH_TRAVERSAL_OUT-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// untrusted input (source)
$ARGS[$IDX]
$VAR
// flows to sink without sanitization
$PATH
```

Good:

```java
org.apache.commons.io.FilenameUtils.getName(...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.PATH_TRAVERSAL_OUT-1.PATH_TRAVERSAL_OUT-1` (metavariables start with `$`):

- `org.apache.commons.io.FilenameUtils.getName(...)`
- `new java.io.FileWriter($PATH, ...)`
- `$PATH`
- `new java.io.FileOutputStream($PATH, ...)`
- `$FUNC(String[] $ARGS) {
  ...
}`
- `$ARGS[$IDX]`
- `$FUNC(..., String $VAR, ...) {
  ...
}`
- `$VAR`
