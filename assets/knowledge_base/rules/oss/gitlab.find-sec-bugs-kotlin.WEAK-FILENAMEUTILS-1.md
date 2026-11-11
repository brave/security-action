---
name: oss/gitlab.find-sec-bugs-kotlin.WEAK-FILENAMEUTILS-1
rubric: safety
severity: should_fix
languages: [kotlin]
cwe: [CWE-22]
---

**Rule.** A file is opened to read its content. The filename comes from an input parameter. If an unfiltered parameter is passed to this file API, files from an arbitrary filesystem location could be read.

**Why.** Reported as CWE-22. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.WEAK_FILENAMEUTILS-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
normalize(...)
getExtension(...)
isExtensions(...)
getName(...)
getBaseName(...)
org.apache.commons.io.FilenameUtils.normalize(...)
org.apache.commons.io.FilenameUtils.getExtension(...)
org.apache.commons.io.FilenameUtils.isExtensions(...)
org.apache.commons.io.FilenameUtils.getName(...)
org.apache.commons.io.FilenameUtils.getBaseName(...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.WEAK_FILENAMEUTILS-1` (metavariables start with `$`):

- `import org.apache.commons.io.FilenameUtils
...`
- `normalize(...)`
- `getExtension(...)`
- `isExtensions(...)`
- `getName(...)`
- `getBaseName(...)`
- `org.apache.commons.io.FilenameUtils.normalize(...)`
- `org.apache.commons.io.FilenameUtils.getExtension(...)`
- `org.apache.commons.io.FilenameUtils.isExtensions(...)`
- `org.apache.commons.io.FilenameUtils.getName(...)`
- `org.apache.commons.io.FilenameUtils.getBaseName(...)`
