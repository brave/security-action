---
name: oss/mobsf.mobsfscan.android.secrets.hardcoded-password
rubric: correctness
severity: should_fix
languages: [java]
cwe: [cwe-798]
---

**Rule.** A hardcoded password in plain text is identified.

**Why.** Reported as cwe-798. Ported from opengrep rule `mobsf.mobsfscan.android.secrets.hardcoded_password` (generated/oss/others.yaml).

## Examples

Bad:

```java
$X = "...";
$M($X, "...", ...);
```

Good:

```java
$X = "";
$M($X, "", ...);
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.android.secrets.hardcoded_password` (metavariables start with `$`):

- `$X = "";`
- `$M($X, "", ...);`
- `$X = "...";`
- `$M($X, "...", ...);`
- `(?i:^.{0,100}pass.{0,100})`
