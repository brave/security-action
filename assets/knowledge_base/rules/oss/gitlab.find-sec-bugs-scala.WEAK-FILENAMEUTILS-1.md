---
name: oss/gitlab.find-sec-bugs-scala.WEAK-FILENAMEUTILS-1
rubric: safety
severity: should_fix
languages: [scala]
---

**Rule.** A file is opened to read its content. The filename comes from an input parameter. If an unfiltered parameter is passed to this file API, files from an arbitrary filesystem location could be read.

**Why.** Reported as CWE-22. Ported from opengrep rule `gitlab.find_sec_bugs_scala.WEAK_FILENAMEUTILS-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.WEAK_FILENAMEUTILS-1` (metavariables start with `$`):

- `import org.apache.commons.io.FilenameUtils._
...`
- `normalize(...)`
- `getExtension(...)`
- `isExtensions(...)`
- `isExtension(...)`
- `getName(...)`
- `getBaseName(...)`
- `org.apache.commons.io.FilenameUtils.normalize(...)`
- `org.apache.commons.io.FilenameUtils.getExtension(...)`
- `org.apache.commons.io.FilenameUtils.isExtensions(...)`
- `org.apache.commons.io.FilenameUtils.isExtension(...)`
- `org.apache.commons.io.FilenameUtils.getName(...)`
- `org.apache.commons.io.FilenameUtils.getBaseName(...)`
