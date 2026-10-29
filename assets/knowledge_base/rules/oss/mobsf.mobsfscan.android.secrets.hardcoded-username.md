---
name: oss/mobsf.mobsfscan.android.secrets.hardcoded-username
rubric: correctness
severity: should_fix
languages: [java]
---

**Rule.** A hardcoded username in plain text is identified.

**Why.** Reported as cwe-798. Ported from opengrep rule `mobsf.mobsfscan.android.secrets.hardcoded_username` (generated/oss/others.yaml).

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

Literal patterns from opengrep rule `mobsf.mobsfscan.android.secrets.hardcoded_username` (metavariables start with `$`):

- `$X = "";`
- `$M($X, "", ...);`
- `$X = "...";`
- `$M($X, "...", ...);`
- `(?i:^.{0,100}user.{0,100})`
