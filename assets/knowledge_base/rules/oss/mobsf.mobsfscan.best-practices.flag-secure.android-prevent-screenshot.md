---
name: oss/mobsf.mobsfscan.best-practices.flag-secure.android-prevent-screenshot
rubric: correctness
severity: nit
languages: [java]
cwe: [cwe-200]
---

**Rule.** This app does not have capabilities to prevent against Screenshots from Recent Task History/ Now On Tap etc.

**Why.** Reported as cwe-200. Ported from opengrep rule `mobsf.mobsfscan.best_practices.flag_secure.android_prevent_screenshot` (generated/oss/others.yaml).

## Examples

Bad:

```java
getWindow().setFlags(WindowManager.LayoutParams.FLAG_SECURE, ...);
$V = WindowManager.LayoutParams.FLAG_SECURE;
...
getWindow().setFlags($V);
getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE, ...);
$V = WindowManager.LayoutParams.FLAG_SECURE;
...
getWindow().addFlags($V);
$A.getWindow().setFlags(WindowManager.LayoutParams.FLAG_SECURE, ...);
$V = WindowManager.LayoutParams.FLAG_SECURE;
...
$A.getWindow().setFlags($V);
$A.getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE, ...);
$V = WindowManager.LayoutParams.FLAG_SECURE;
...
$A.getWindow().addFlags($V);
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.best_practices.flag_secure.android_prevent_screenshot` (metavariables start with `$`):

- `getWindow().setFlags(WindowManager.LayoutParams.FLAG_SECURE, ...);`
- `$V = WindowManager.LayoutParams.FLAG_SECURE;
...
getWindow().setFlags($V);`
- `getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE, ...);`
- `$V = WindowManager.LayoutParams.FLAG_SECURE;
...
getWindow().addFlags($V);`
- `$A.getWindow().setFlags(WindowManager.LayoutParams.FLAG_SECURE, ...);`
- `$V = WindowManager.LayoutParams.FLAG_SECURE;
...
$A.getWindow().setFlags($V);`
- `$A.getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE, ...);`
- `$V = WindowManager.LayoutParams.FLAG_SECURE;
...
$A.getWindow().addFlags($V);`
