---
name: oss/trailofbits.generic.postgres-insecure-sslmode.postgres-insecure-sslmode
rubric: safety
severity: should_fix
languages: [regex]
---

**Rule.** Found PostgreSQL connection string disabling SSL verification

**Why.** Reported as CWE-295: Improper Certificate Validation. See https://www.postgresql.org/docs/current/libpq-connect.html. Ported from opengrep rule `trailofbits.generic.postgres-insecure-sslmode.postgres-insecure-sslmode` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.generic.postgres-insecure-sslmode.postgres-insecure-sslmode` (metavariables start with `$`):

- `(?i)postgresql://.+[?&]sslmode=(disable|allow|prefer).*$`
- `(?i)postgresql://.+[?&]requiressl=0.*$`
- `(?i)postgresql://.+[?&]ssl=false.*$`
- `(?i)postgres://.+[?&]sslmode=(disable|allow|prefer).*$`
- `(?i)postgres://.+[?&]requiressl=0.*$`
- `(?i)postgres://.+[?&]ssl=false.*$`
