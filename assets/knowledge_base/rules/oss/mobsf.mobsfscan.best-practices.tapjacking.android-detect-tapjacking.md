---
name: oss/mobsf.mobsfscan.best-practices.tapjacking.android-detect-tapjacking
rubric: correctness
severity: nit
languages: [java]
---

**Rule.** This app does not have capabilities to prevent tapjacking attacks. An attacker can hijack the user's taps and tricks him into performing some critical operations that he did not intend to.

**Why.** Reported as cwe-200. Ported from opengrep rule `mobsf.mobsfscan.best_practices.tapjacking.android_detect_tapjacking` (generated/oss/others.yaml).

## Examples

Bad:

```java
$F.setFilterTouchesWhenObscured(true);
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.best_practices.tapjacking.android_detect_tapjacking` (metavariables start with `$`):

- `$F.setFilterTouchesWhenObscured(true);`
