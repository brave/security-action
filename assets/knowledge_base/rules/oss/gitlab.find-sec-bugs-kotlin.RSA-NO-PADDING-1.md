---
name: oss/gitlab.find-sec-bugs-kotlin.RSA-NO-PADDING-1
rubric: safety
severity: should_fix
languages: [kotlin]
---

**Rule.** The software uses the RSA algorithm but does not incorporate Optimal Asymmetric Encryption Padding (OAEP), which might weaken the encryption.

**Why.** Reported as CWE-780. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.RSA_NO_PADDING-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.RSA_NO_PADDING-1` (metavariables start with `$`):

- `$VAR = "$ALG";
...
javax.crypto.Cipher.getInstance($VAR);`
- `.*RSA.*NoPadding.*`
- `javax.crypto.Cipher.getInstance($ALG,...);`
