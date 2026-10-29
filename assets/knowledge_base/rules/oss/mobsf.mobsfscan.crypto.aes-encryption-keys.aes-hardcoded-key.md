---
name: oss/mobsf.mobsfscan.crypto.aes-encryption-keys.aes-hardcoded-key
rubric: correctness
severity: should_fix
languages: [java]
cwe: [cwe-321]
---

**Rule.** Hardcoded encryption key makes AES symmetric encryption useless. An attacker can easily reverse engineer the application and recover the keys.

**Why.** Reported as cwe-321. Ported from opengrep rule `mobsf.mobsfscan.crypto.aes_encryption_keys.aes_hardcoded_key` (generated/oss/others.yaml).

## Examples

Bad:

```java
$S = new SecretKeySpec("...".getBytes(), "AES");
...
$C.init(..., $S);
$P = "...";
...
$S = new SecretKeySpec($P.getBytes(), "AES");
...
$C.init(..., $S);
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.crypto.aes_encryption_keys.aes_hardcoded_key` (metavariables start with `$`):

- `$S = new SecretKeySpec("...".getBytes(), "AES");
...
$C.init(..., $S);`
- `$P = "...";
...
$S = new SecretKeySpec($P.getBytes(), "AES");
...
$C.init(..., $S);`
