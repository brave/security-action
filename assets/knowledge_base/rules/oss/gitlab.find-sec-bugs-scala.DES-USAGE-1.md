---
name: oss/gitlab.find-sec-bugs-scala.DES-USAGE-1
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-326]
---

**Rule.** DES is considered strong ciphers for modern applications. Currently, NIST recommends the usage of AES block ciphers instead of DES.

**Why.** Reported as CWE-326. Ported from opengrep rule `gitlab.find_sec_bugs_scala.DES_USAGE-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.DES_USAGE-1` (metavariables start with `$`):

- `javax.crypto.Cipher.getInstance("$ALG")`
- `^(DES)/.*`
