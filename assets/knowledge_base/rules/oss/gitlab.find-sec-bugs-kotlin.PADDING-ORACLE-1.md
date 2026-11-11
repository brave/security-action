---
name: oss/gitlab.find-sec-bugs-kotlin.PADDING-ORACLE-1
rubric: safety
severity: should_fix
languages: [kotlin]
cwe: [CWE-327]
---

**Rule.** This specific mode of CBC with PKCS5Padding is susceptible to padding oracle attacks. An adversary could potentially decrypt the message if the system exposed the difference between plaintext with invalid padding or valid padding. The distinction between valid and invalid padding is usually revealed through distinct error messages being returned for each condition.

**Why.** Reported as CWE-327. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.PADDING_ORACLE-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
javax.crypto.Cipher.getInstance($TRANSFORMATION)
```

Good:

```text
^"(RSA|ECIES)/
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.PADDING_ORACLE-1` (metavariables start with `$`):

- `javax.crypto.Cipher.getInstance($TRANSFORMATION)`
- `^"[^/]*/CBC/PKCS5Padding`
- `^"(RSA|ECIES)/`
