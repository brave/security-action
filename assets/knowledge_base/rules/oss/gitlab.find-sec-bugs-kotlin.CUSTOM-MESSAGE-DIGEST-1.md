---
name: oss/gitlab.find-sec-bugs-kotlin.CUSTOM-MESSAGE-DIGEST-1
rubric: safety
severity: should_fix
languages: [kotlin]
---

**Rule.** Implementing a custom MessageDigest is error-prone. National Institute of Standards and Technology(NIST) recommends the use of SHA-224, SHA-256, SHA-384, SHA-512, SHA-512/224, or SHA-512/256.

**Why.** Reported as CWE-327. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.CUSTOM_MESSAGE_DIGEST-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.CUSTOM_MESSAGE_DIGEST-1` (metavariables start with `$`):

- `class $CLAZZ : java.security.MessageDigest(...) {
  ...
}`
