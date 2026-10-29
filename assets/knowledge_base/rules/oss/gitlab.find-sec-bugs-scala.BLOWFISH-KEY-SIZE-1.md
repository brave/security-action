---
name: oss/gitlab.find-sec-bugs-scala.BLOWFISH-KEY-SIZE-1
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-326]
---

**Rule.** A small key size makes the ciphertext vulnerable to brute force attacks. At least 128 bits of entropy should be used when generating the key if use of Blowfish is required.

**Why.** Reported as CWE-326. Ported from opengrep rule `gitlab.find_sec_bugs_scala.BLOWFISH_KEY_SIZE-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.BLOWFISH_KEY_SIZE-1` (metavariables start with `$`):

- `$KEYGEN = javax.crypto.KeyGenerator.getInstance("Blowfish", ...);
...
$KEYGEN.init($KEY_SIZE);`
