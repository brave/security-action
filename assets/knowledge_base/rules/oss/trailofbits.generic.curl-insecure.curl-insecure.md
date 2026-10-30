---
name: oss/trailofbits.generic.curl-insecure.curl-insecure
rubric: safety
severity: should_fix
languages: [generic]
cwe: [CWE-295]
---

**Rule.** Found `curl` command disabling SSL verification

**Why.** Reported as CWE-295: Improper Certificate Validation. See https://curl.se/docs/manpage.html. Ported from opengrep rule `trailofbits.generic.curl-insecure.curl-insecure` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.generic.curl-insecure.curl-insecure` (metavariables start with `$`):

- `curl ... -k`
- `curl ... --insecure`
