---
name: oss/gitlab.find-sec-bugs-scala.TDES-USAGE-1
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-326]
---

**Rule.** Triple DES (also known as 3DES or DESede) is considered strong ciphers for modern applications. NIST recommends the usage of AES block ciphers instead of 3DES.

**Why.** Reported as CWE-326. Ported from opengrep rule `gitlab.find_sec_bugs_scala.TDES_USAGE-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.TDES_USAGE-1` (metavariables start with `$`):

- `javax.crypto.Cipher.getInstance("$ALG")`
- `^(DESede)/.*`
