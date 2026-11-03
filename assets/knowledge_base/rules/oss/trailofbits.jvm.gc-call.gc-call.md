---
name: oss/trailofbits.jvm.gc-call.gc-call
rubric: correctness
severity: should_fix
languages: [java, kotlin]
---

**Rule.** Calling `gc` suggests to the JVM that the garbage collector should be run, and memory should be reclaimed. This is only a suggestion, and there is no guarantee that anything will happen. Relying on this behavior for correctness or memory management is an anti-pattern.

**Why.** See https://stackoverflow.com/questions/2414105/why-is-it-bad-practice-to-call-system-gc. Ported from opengrep rule `trailofbits.jvm.gc-call.gc-call` (generated/oss/others.yaml).

## Examples

Bad:

```java
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.jvm.gc-call.gc-call` (metavariables start with `$`):

- `System.gc()`
- `Runtime.getRuntime().gc()`
