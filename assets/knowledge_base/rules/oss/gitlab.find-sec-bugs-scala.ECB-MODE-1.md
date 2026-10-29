---
name: oss/gitlab.find-sec-bugs-scala.ECB-MODE-1
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-326]
---

**Rule.** An authentication cipher mode which provides better confidentiality of the encrypted data should be used instead of Electronic Code Book (ECB) mode, which does not provide good confidentiality. Specifically, ECB mode produces the same output for the same input each time. This allows an attacker to intercept and replay the data.

**Why.** Reported as CWE-326. Ported from opengrep rule `gitlab.find_sec_bugs_scala.ECB_MODE-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
(AES|DES(ede)?)(/ECB/*)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.ECB_MODE-1` (metavariables start with `$`):

- `javax.crypto.Cipher.getInstance("...")`
- `(AES|DES(ede)?)(/ECB/*)`
