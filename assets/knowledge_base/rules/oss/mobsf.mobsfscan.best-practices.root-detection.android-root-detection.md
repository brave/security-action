---
name: oss/mobsf.mobsfscan.best-practices.root-detection.android-root-detection
rubric: correctness
severity: nit
languages: [java]
---

**Rule.** This app does not have root detection capabilities. Running a sensitive application on a rooted device questions the device integrity and affects users data.

**Why.** Reported as cwe-919. Ported from opengrep rule `mobsf.mobsfscan.best_practices.root_detection.android_root_detection` (generated/oss/others.yaml).

## Examples

Bad:

```java
$J.isJailBroken(...)
$R.isDeviceRooted(...)
$R.isRooted(...)
RootTools.isAccessGiven(...)
$MTD.contains("test-keys")
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.best_practices.root_detection.android_root_detection` (metavariables start with `$`):

- `$J.isJailBroken(...)`
- `$R.isDeviceRooted(...)`
- `$R.isRooted(...)`
- `RootTools.isAccessGiven(...)`
- `$MTD.contains("test-keys")`
