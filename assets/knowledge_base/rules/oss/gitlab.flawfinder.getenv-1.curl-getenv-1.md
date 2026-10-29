---
name: oss/gitlab.flawfinder.getenv-1.curl-getenv-1
rubric: safety
severity: should_fix
languages: [c, cpp]
cwe: [CWE-20]
---

**Rule.** This function's return value should be treated as untrusted input as it could be modified by an attacker. Possible risks include: - The value being too large and causing buffer overflows - Files under the attacker's control being used maliciously - Files outside of an attacker's control becoming accessible, depending on access privileges.

**Why.** Reported as CWE-20. Ported from opengrep rule `gitlab.flawfinder.getenv-1.curl_getenv-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.getenv-1.curl_getenv-1` (metavariables start with `$`):

- `getenv(...)`
- `curl_getenv(...)`
