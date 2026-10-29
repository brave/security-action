---
name: oss/gitlab.eslint.detect-pseudoRandomBytes
rubric: safety
severity: should_fix
languages: [javascript, typescript]
---

**Rule.** Depending on the context, generating weak random numbers may expose cryptographic functions, which rely on these numbers, to be exploitable. When generating numbers for sensitive values such as tokens, nonces, and cryptographic keys, it is recommended that the `randomBytes` method of the `crypto` module be used instead of `pseudoRandomBytes`. Example using `randomBytes`: ``` // Generate 256 bytes of random data const randomBytes = crypto.randomBytes(256); ``` For more information on JavaScript Cryptography see: https://nodejs.org/api/crypto.html#cryptorandombytessize-callback

**Why.** Reported as CWE-338. Ported from opengrep rule `gitlab.eslint.detect-pseudoRandomBytes` (generated/oss/security_noaudit_novuln.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.eslint.detect-pseudoRandomBytes` (metavariables start with `$`):

- `crypto.pseudoRandomBytes`
