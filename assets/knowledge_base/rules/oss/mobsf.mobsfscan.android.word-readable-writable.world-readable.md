---
name: oss/mobsf.mobsfscan.android.word-readable-writable.world-readable
rubric: correctness
severity: should_fix
languages: [java]
cwe: [cwe-276]
---

**Rule.** The file is World Readable. Any App can read from the file.

**Why.** Reported as cwe-276. Ported from opengrep rule `mobsf.mobsfscan.android.word_readable_writable.world_readable` (generated/oss/others.yaml).

## Examples

Bad:

```java
Context.MODE_WORLD_READABLE
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.android.word_readable_writable.world_readable` (metavariables start with `$`):

- `Context.MODE_WORLD_READABLE`
