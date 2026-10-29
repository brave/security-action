---
name: oss/trailofbits.generic.mysql-insecure-sslmode.mysql-insecure-sslmode
rubric: safety
severity: should_fix
languages: [regex]
---

**Rule.** Found MySQL connection string disabling SSL verification

**Why.** Reported as CWE-295: Improper Certificate Validation. See https://dev.mysql.com/doc/connector-net/en/connector-net-8-0-connection-options.html. See https://dev.mysql.com/doc/connector-j/en/connector-j-connp-props-security.html. Ported from opengrep rule `trailofbits.generic.mysql-insecure-sslmode.mysql-insecure-sslmode` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.generic.mysql-insecure-sslmode.mysql-insecure-sslmode` (metavariables start with `$`):

- `(?i)Ssl[ -]?Mode=(Disabled|None|Preferred)`
- `(?i)sslMode=(DISABLED|PREFERRED)`
- `(?i)useSSL=false`
