---
name: oss/gitlab.bandit.B413
rubric: safety
severity: should_fix
languages: [python]
cwe: [CWE-1104]
---

**Rule.** The application was detected importing `pycrypto`. This package has been deprecated as it contains security vulnerabilities. To remediate this issue, consider using the [cryptography](https://cryptography.io/) package instead.

**Why.** Reported as CWE-1104. Ported from opengrep rule `gitlab.bandit.B413` (generated/oss/audit.yaml).

## Examples

Bad:

```python
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B413` (metavariables start with `$`):

- `import pycryto`
- `import Crypto.Cipher`
- `import Crypto.Hash`
- `import Crypto.IO`
- `import Crypto.Protocol`
- `import Crypto.PublicKey`
- `import Crypto.Random`
- `import Crypto.Signature`
- `import Crypto.Util`
