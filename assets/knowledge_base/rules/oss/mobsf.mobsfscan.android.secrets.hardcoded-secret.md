---
name: oss/mobsf.mobsfscan.android.secrets.hardcoded-secret
rubric: correctness
severity: should_fix
languages: [java]
cwe: [cwe-798]
---

**Rule.** A hardcoded secret is identified.

**Why.** Reported as cwe-798. Ported from opengrep rule `mobsf.mobsfscan.android.secrets.hardcoded_secret` (generated/oss/others.yaml).

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

Literal patterns from opengrep rule `mobsf.mobsfscan.android.secrets.hardcoded_secret` (metavariables start with `$`):

- `$X = "";`
- `$M($X, "", ...);`
- `$X = "...";`
- `$M($X, "...", ...);`
- `(?i:^.{0,100}secret.{0,100})`
