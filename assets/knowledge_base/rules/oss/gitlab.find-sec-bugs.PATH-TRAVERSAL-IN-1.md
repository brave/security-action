---
name: oss/gitlab.find-sec-bugs.PATH-TRAVERSAL-IN-1
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** A file is opened to read its content. The filename comes from an input parameter. If an unfiltered parameter is passed to this file API, files from an arbitrary filesystem location could be read. This rule identifies potential path traversal vulnerabilities. In many cases, the constructed file path cannot be controlled by the user.

**Why.** Reported as CWE-22. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs.PATH_TRAVERSAL_IN-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// untrusted input (source)
$ARGS[$IDX]
$VAR
// flows to sink without sanitization
$VAR
$INPUT
new java.io.FileReader(...)
new javax.activation.FileDataSource(...)
new java.io.FileInputStream(...)
```

Good:

```java
org.apache.commons.io.FilenameUtils.getName(...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.PATH_TRAVERSAL_IN-1` (metavariables start with `$`):

- `org.apache.commons.io.FilenameUtils.getName(...)`
- `$U = new java.net.URI($VAR)`
- `new java.io.File($U)`
- `java.nio.file.Paths.get($U)`
- `$VAR`
- `new java.io.RandomAccessFile($INPUT,...)`
- `$INPUT`
- `new java.io.FileReader(...)`
- `new javax.activation.FileDataSource(...)`
- `new java.io.FileInputStream(...)`
- `new java.io.File(...,(String $VAR), ...)`
- `java.nio.file.Paths.get(...,(String $VAR),...)`
- `java.io.File.createTempFile(...,(String $VAR), ...)`
- `java.io.File.createTempDirectory(...,(String $VAR),...)`
- `java.nio.file.Files.createTempFile(..., (String $VAR), ...)`
- `java.nio.file.Files.createTempDirectory(..., (String $VAR), ...)`
- `$FUNC(String[] $ARGS) {
  ...
}`
- `$ARGS[$IDX]`
- `$FUNC(..., String $VAR, ...) {
  ...
}`
