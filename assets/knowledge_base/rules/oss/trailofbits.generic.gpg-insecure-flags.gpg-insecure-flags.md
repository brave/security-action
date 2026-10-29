---
name: oss/trailofbits.generic.gpg-insecure-flags.gpg-insecure-flags
rubric: safety
severity: should_fix
languages: [generic]
---

**Rule.** Found `gpg` command using insecure flags

**Why.** Reported as CWE-295: Improper Certificate Validation. See https://www.gnupg.org/gph/de/manual/r1023.html. Ported from opengrep rule `trailofbits.generic.gpg-insecure-flags.gpg-insecure-flags` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.generic.gpg-insecure-flags.gpg-insecure-flags` (metavariables start with `$`):

- `gpg ... --allow-non-selfsigned-uid`
- `gpg ... --allow-freeform-uid`
- `gpg ... --allow-old-cipher-algos`
- `gpg ... --allow-weak-digest-algos`
- `gpg ... --allow-weak-key-signatures`
- `gpg ... --ignore-time-conflict`
- `gpg ... --ignore-valid-from`
- `gpg ... --ignore-crc-error`
- `gpg ... --ignore-mdc-error`
- `gpg ... --skip-verify`
- `gpg ... --no-require-cross-certification`
