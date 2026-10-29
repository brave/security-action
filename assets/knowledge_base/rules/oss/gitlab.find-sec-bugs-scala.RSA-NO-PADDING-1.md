---
name: oss/gitlab.find-sec-bugs-scala.RSA-NO-PADDING-1
rubric: safety
severity: should_fix
languages: [scala]
---

**Rule.** The software uses the RSA algorithm but does not incorporate Optimal Asymmetric Encryption Padding (OAEP), which might weaken the encryption.

**Why.** Reported as CWE-780. Ported from opengrep rule `gitlab.find_sec_bugs_scala.RSA_NO_PADDING-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
javax.crypto.Cipher.getInstance("$ALG",...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.RSA_NO_PADDING-1` (metavariables start with `$`):

- `javax.crypto.Cipher.getInstance("$ALG",...)`
- `.*NoPadding.*`
