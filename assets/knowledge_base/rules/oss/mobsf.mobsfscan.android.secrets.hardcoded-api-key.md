---
name: oss/mobsf.mobsfscan.android.secrets.hardcoded-api-key
rubric: correctness
severity: should_fix
languages: [java]
---

**Rule.** A hardcoded Key is identified.

**Why.** Reported as cwe-798. Ported from opengrep rule `mobsf.mobsfscan.android.secrets.hardcoded_api_key` (generated/oss/others.yaml).

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

Literal patterns from opengrep rule `mobsf.mobsfscan.android.secrets.hardcoded_api_key` (metavariables start with `$`):

- `$X = "";`
- `$M($X, "", ...);`
- `$X = "...";`
- `$M($X, "...", ...);`
- `(?i:^.{0,100}key.{0,100})`
