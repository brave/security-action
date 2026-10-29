---
name: oss/gitlab.find-sec-bugs-scala.NULL-CIPHER-1
rubric: safety
severity: should_fix
languages: [scala]
---

**Rule.** The NullCipher implements the Cipher interface by returning ciphertext identical to the supplied plaintext. In a few contexts, such as testing, a NullCipher may be appropriate. Avoid using the NullCipher. Its accidental use can introduce a significant confidentiality risk.

**Why.** Reported as CWE-327. Ported from opengrep rule `gitlab.find_sec_bugs_scala.NULL_CIPHER-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.NULL_CIPHER-1` (metavariables start with `$`):

- `new javax.crypto.NullCipher()`
