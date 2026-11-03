---
name: oss/trailofbits.ruby.active-record-hardcoded-encryption-key.active-record-hardcoded--17ugljk
rubric: safety
severity: should_fix
languages: [ruby]
cwe: [CWE-798]
---

**Rule.** Found hardcoded ActiveRecord encryption key

**Why.** Reported as CWE-798: Use of Hard-coded Credentials. See https://guides.rubyonrails.org/active_record_encryption.html#supported-types. Ported from opengrep rule `trailofbits.ruby.active-record-hardcoded-encryption-key.active-record-hardcoded-encryption-key` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.ruby.active-record-hardcoded-encryption-key.active-record-hardcoded-encryption-key` (metavariables start with `$`):

- `config.active_record.encryption.primary_key = "..."`
- `config.active_record.encryption.primary_key = [..., "...", ...]`
- `config.active_record.encryption.deterministic_key = "..."`
- `config.active_record.encryption.deterministic_key = [..., "...", ...]`
