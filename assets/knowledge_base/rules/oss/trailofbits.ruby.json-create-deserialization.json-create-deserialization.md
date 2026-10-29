---
name: oss/trailofbits.ruby.json-create-deserialization.json-create-deserialization
rubric: safety
severity: nit
languages: [ruby]
cwe: [CWE-502]
---

**Rule.** Found `json_create` class method. This implies custom JSON deserialization is occuring. This can lead to RCE and other deserialization-type bugs. Usage should be audited and, at least, fuzzed.

**Why.** Reported as CWE-502: Deserialization of Untrusted Data. See https://github.blog/2024-06-20-execute-commands-by-sending-json-learn-how-unsafe-deserialization-vulnerabilities-work-in-ruby-projects/. See https://github.com/github/codeql/blob/main/ruby/ql/lib/codeql/ruby/security/UnsafeDeserializationCustomizations.qll. See https://stackoverflow.com/questions/17226402/whats-the-difference-between-json-load-and-json-parse-methods-of-ruby-lib. Ported from opengrep rule `trailofbits.ruby.json-create-deserialization.json-create-deserialization` (generated/oss/audit.yaml).

## Examples

Bad:

```text
def self.json_create($OBJ)
  ...
end
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.ruby.json-create-deserialization.json-create-deserialization` (metavariables start with `$`):

- `class $CLS
  ...
end`
- `def self.json_create($OBJ)
  ...
end`
