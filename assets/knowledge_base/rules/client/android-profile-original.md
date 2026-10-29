---
name: client/android-profile-original
rubric: correctness
severity: should_fix
languages: [java, kotlin]
---

**Rule.** Getting the original profile explicitly can lead to security and privacy issues

**Why.** Ported from opengrep rule `android-profile-original` (client/android-profile-original.yaml).

## Examples

Bad:

```java
....getOriginalProfile()
```

## Detection hints

Literal patterns from opengrep rule `android-profile-original` (metavariables start with `$`):

- `....getOriginalProfile()`
