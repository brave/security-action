---
name: oss/mobsf.mobsfscan.android.word-readable-writable.world-writeable
rubric: correctness
severity: should_fix
languages: [java]
cwe: [cwe-276]
---

**Rule.** The file is World Readable and Writable. Any App can read/write to the file.

**Why.** Reported as cwe-276. Ported from opengrep rule `mobsf.mobsfscan.android.word_readable_writable.world_writeable` (generated/oss/others.yaml).

## Examples

Bad:

```java
Context.MODE_WORLD_WRITEABLE
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.android.word_readable_writable.world_writeable` (metavariables start with `$`):

- `Context.MODE_WORLD_WRITEABLE`
