---
name: oss/trailofbits.generic.wget-no-check-certificate.wget-no-check-certificate
rubric: safety
severity: should_fix
languages: [generic]
---

**Rule.** Found `wget` command disabling SSL verification

**Why.** Reported as CWE-295: Improper Certificate Validation. See https://linux.die.net/man/1/wget. Ported from opengrep rule `trailofbits.generic.wget-no-check-certificate.wget-no-check-certificate` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.generic.wget-no-check-certificate.wget-no-check-certificate` (metavariables start with `$`):

- `wget ... --no-check-certificate`
- `wget ... --no-hsts`
