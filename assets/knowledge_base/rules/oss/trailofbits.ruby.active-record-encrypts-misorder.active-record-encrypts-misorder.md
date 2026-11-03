---
name: oss/trailofbits.ruby.active-record-encrypts-misorder.active-record-encrypts-misorder
rubric: safety
severity: should_fix
languages: [ruby]
cwe: [CWE-311]
---

**Rule.** Found an ActiveRecord value with encryption before serialization. The declaration of the serialized attribute should go before the encryption declaration.

**Why.** Reported as CWE-311: Missing Encryption of Sensitive Data. See https://guides.rubyonrails.org/active_record_encryption.html#supported-types. Ported from opengrep rule `trailofbits.ruby.active-record-encrypts-misorder.active-record-encrypts-misorder` (generated/oss/audit.yaml).

## Examples

Bad:

```text
encrypts($SYM, ...)
...
serialize($SYM, ...)
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.ruby.active-record-encrypts-misorder.active-record-encrypts-misorder` (metavariables start with `$`):

- `class $CLS < ApplicationRecord
  ...
end`
- `encrypts($SYM, ...)
...
serialize($SYM, ...)`
