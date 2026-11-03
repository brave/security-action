---
name: oss/gitlab.find-sec-bugs-scala.PATH-TRAVERSAL-IN-1.SCALA-PATH-TRAVERSAL-IN-1
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-22]
---

**Rule.** A file is opened to read its content. The filename comes from an input parameter. If an unfiltered parameter is passed to this file API, files from an arbitrary filesystem location could be read. This rule identifies potential path traversal vulnerabilities. In many cases, the constructed file path cannot be controlled by the user.

**Why.** Reported as CWE-22. Ported from opengrep rule `gitlab.find_sec_bugs_scala.PATH_TRAVERSAL_IN-1.SCALA_PATH_TRAVERSAL_IN-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
new java.io.File($U)
java.nio.file.Paths.get($U)
new java.io.RandomAccessFile(..., $VAR,...)
new java.io.FileReader(<...$VAR...>, ...)
new javax.activation.FileDataSource(..., $VAR, ...)
new java.io.FileInputStream(..., $VAR, ...)
new java.io.File(<...$VAR...>, ...)
java.nio.file.Paths.get(...,$VAR,...)
java.io.File.createTempFile(...,$VAR, ...)
java.io.File.createTempDirectory(...,$VAR,...)
java.nio.file.Files.createTempFile(..., $VAR, ...)
java.nio.file.Files.createTempDirectory(..., $VAR, ...)
scala.io.Source.from(<...$VAR...>)
scala.io.Source.fromFile(<...$VAR...>)
scala.io.Source.fromString(<...$VAR...>)
```

Good:

```text
...
org.apache.commons.io.FilenameUtils.getName($VAR)
...
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.PATH_TRAVERSAL_IN-1.SCALA_PATH_TRAVERSAL_IN-1` (metavariables start with `$`):

- `def $FUNC(...,$ARGS: Array[String], ...): $TYPE = {
...
}`
- `$VAR = $ARGS($IDX)
...`
- `def $FUNC(...,$VAR: String, ...): $TYPE = {
...
}`
- `...
org.apache.commons.io.FilenameUtils.getName($VAR)
...`
- `$U = new java.net.URI($VAR)
...`
- `new java.io.File($U)`
- `java.nio.file.Paths.get($U)`
- `new java.io.RandomAccessFile(..., $VAR,...)`
- `new java.io.FileReader(<...$VAR...>, ...)`
- `new javax.activation.FileDataSource(..., $VAR, ...)`
- `new java.io.FileInputStream(..., $VAR, ...)`
- `new java.io.File(<...$VAR...>, ...)`
- `java.nio.file.Paths.get(...,$VAR,...)`
- `java.io.File.createTempFile(...,$VAR, ...)`
- `java.io.File.createTempDirectory(...,$VAR,...)`
- `java.nio.file.Files.createTempFile(..., $VAR, ...)`
- `java.nio.file.Files.createTempDirectory(..., $VAR, ...)`
- `scala.io.Source.from(<...$VAR...>)`
- `scala.io.Source.fromFile(<...$VAR...>)`
- `scala.io.Source.fromString(<...$VAR...>)`
