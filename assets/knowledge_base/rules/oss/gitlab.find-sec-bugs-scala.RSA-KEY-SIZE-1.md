---
name: oss/gitlab.find-sec-bugs-scala.RSA-KEY-SIZE-1
rubric: safety
severity: should_fix
languages: [scala]
---

**Rule.** Detected an insufficient key size for DSA. NIST recommends a key size of 2048 or higher.

**Why.** Reported as CWE-326. Ported from opengrep rule `gitlab.find_sec_bugs_scala.RSA_KEY_SIZE-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
$VAR.initialize($SIZE, ...)
new java.security.spec.RSAKeyGenParameterSpec($SIZE, ...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.RSA_KEY_SIZE-1` (metavariables start with `$`):

- `$GEN = KeyPairGenerator.getInstance($ALG, ...);
...`
- `$VAR.initialize($SIZE, ...)`
- `new java.security.spec.RSAKeyGenParameterSpec($SIZE, ...)`
- `"(RSA|DSA)"`
