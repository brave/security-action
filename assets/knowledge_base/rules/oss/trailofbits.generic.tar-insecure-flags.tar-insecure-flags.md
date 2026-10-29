---
name: oss/trailofbits.generic.tar-insecure-flags.tar-insecure-flags
rubric: safety
severity: should_fix
languages: [generic]
---

**Rule.** Found `tar` command using insecure flags

**Why.** Reported as CWE-73: External Control of File Name or Path. See https://man7.org/linux/man-pages/man1/tar.1.html. Ported from opengrep rule `trailofbits.generic.tar-insecure-flags.tar-insecure-flags` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.generic.tar-insecure-flags.tar-insecure-flags` (metavariables start with `$`):

- `tar ... -P`
- `tar ... --absolute-paths`
- `tar ... --absolute-names`
- `tar ... --passphrase`
