---
name: oss/trailofbits.ruby.yaml-unsafe-load.yaml-unsafe-load
rubric: safety
severity: should_fix
languages: [ruby]
cwe: [CWE-502]
---

**Rule.** Found YAML call to `unsafe_load`. This can lead to deserialization bugs and RCE.

**Why.** Reported as CWE-502: Deserialization of Untrusted Data. See https://bishopfox.com/blog/ruby-vulnerabilities-exploits. See https://github.com/semgrep/semgrep-rules/blob/develop/ruby/lang/security/bad-deserialization-yaml.yaml. Ported from opengrep rule `trailofbits.ruby.yaml-unsafe-load.yaml-unsafe-load` (generated/oss/audit.yaml).

## Examples

Bad:

```text
YAML.unsafe_load(...)
Psych.unsafe_load(...)
serialize(..., yaml: { ..., unsafe_load: true, ... }, ...)
```

Good:

```text
YAML.unsafe_load("...")
Psych.unsafe_load("...")
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.ruby.yaml-unsafe-load.yaml-unsafe-load` (metavariables start with `$`):

- `YAML.unsafe_load(...)`
- `Psych.unsafe_load(...)`
- `serialize(..., yaml: { ..., unsafe_load: true, ... }, ...)`
- `YAML.unsafe_load("...")`
- `Psych.unsafe_load("...")`
