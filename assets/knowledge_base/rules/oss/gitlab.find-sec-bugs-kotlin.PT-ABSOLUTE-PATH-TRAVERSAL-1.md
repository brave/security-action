---
name: oss/gitlab.find-sec-bugs-kotlin.PT-ABSOLUTE-PATH-TRAVERSAL-1
rubric: safety
severity: should_fix
languages: [kotlin]
---

**Rule.** The software uses an HTTP request parameter to construct a pathname that should be within a restricted directory, but it does not properly neutralize absolute path sequences such as "/abs/path" that can resolve to a location that is outside of that directory. See http://cwe.mitre.org/data/definitions/36.html for more information.

**Why.** Reported as CWE-22. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.PT_ABSOLUTE_PATH_TRAVERSAL-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// untrusted input (source)
($REQ: HttpServletRequest).getParameter(...)
// flows to sink without sanitization
$VAR
$INPUT
java.io.FileReader(...)
javax.activation.FileDataSource(...)
java.io.FileInputStream(...)
java.io.File(...)
java.nio.file.Paths.get(...)
java.io.File.createTempFile(...)
java.io.File.createTempDirectory(...)
java.nio.file.Files.createTempFile(...)
java.nio.file.Files.createTempDirectory(...)
$SRC.$METHOD(...)
getClass()
getClass().getClassLoader()
($C: ClassLoader)
($C: Class)
$CLZ.getClassLoader()
getResourceAsStream
getResource
$PATH
```

Good:

```text
org.apache.commons.io.FilenameUtils.getName(...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.PT_ABSOLUTE_PATH_TRAVERSAL-1` (metavariables start with `$`):

- `org.apache.commons.io.FilenameUtils.getName(...)`
- `$U = java.net.URI($VAR)`
- `java.io.File($U)`
- `java.nio.file.Paths.get($U)`
- `$VAR`
- `java.io.RandomAccessFile($INPUT,...)`
- `$INPUT`
- `java.io.FileReader(...)`
- `javax.activation.FileDataSource(...)`
- `java.io.FileInputStream(...)`
- `java.io.File(...)`
- `java.nio.file.Paths.get(...)`
- `java.io.File.createTempFile(...)`
- `java.io.File.createTempDirectory(...)`
- `java.nio.file.Files.createTempFile(...)`
- `java.nio.file.Files.createTempDirectory(...)`
- `$SRC.$METHOD(...)`
- `getClass()`
- `getClass().getClassLoader()`
- `($C: ClassLoader)`
- `($C: Class)`
- `$CLZ.getClassLoader()`
- `getResourceAsStream`
- `getResource`
- `java.io.FileWriter($PATH, ...)`
- `$PATH`
- `java.io.FileOutputStream($PATH, ...)`
- `($REQ: HttpServletRequest).getParameter(...)`
- `fun $FUNC(..., @RequestParam $REQ:$TYPE, ...) {...}`
