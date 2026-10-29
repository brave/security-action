---
name: oss/trailofbits.generic.wget-unencrypted-url.wget-unencrypted-url
rubric: safety
severity: should_fix
languages: [generic]
---

**Rule.** Found `wget` command with unencrypted URL (e.g. HTTP, FTP, etc.)

**Why.** Reported as CWE-319: Cleartext Transmission of Sensitive Information. See https://linux.die.net/man/1/wget. Ported from opengrep rule `trailofbits.generic.wget-unencrypted-url.wget-unencrypted-url` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.generic.wget-unencrypted-url.wget-unencrypted-url` (metavariables start with `$`):

- `wget ... http://`
- `wget ... ftp://`
