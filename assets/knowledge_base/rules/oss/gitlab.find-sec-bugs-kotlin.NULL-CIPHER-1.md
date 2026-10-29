---
name: oss/gitlab.find-sec-bugs-kotlin.NULL-CIPHER-1
rubric: safety
severity: should_fix
languages: [kotlin]
---

**Rule.** The NullCipher implements the Cipher interface by returning ciphertext identical to the supplied plaintext. In a few contexts, such as testing, a NullCipher may be appropriate. Avoid using the NullCipher. Its accidental use can introduce a significant confidentiality risk.

**Why.** Reported as CWE-327. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.NULL_CIPHER-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.NULL_CIPHER-1` (metavariables start with `$`):

- `javax.crypto.NullCipher()`
