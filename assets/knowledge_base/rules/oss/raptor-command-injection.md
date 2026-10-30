---
name: oss/raptor-command-injection
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** The software constructs an OS command using externally-influenced input, but it does not neutralize or incorrectly neutralizes special elements that could modify the intended OS command.

**Why.** See https://cwe.mitre.org/data/definitions/676. See https://cwe.mitre.org/data/definitions/78. See https://cwe.mitre.org/data/definitions/88. See https://g.co/kgs/PCHQjJ. See https://www.sei.cmu.edu/downloads/sei-cert-c-coding-standard-2016-v01.pdf. Ported from opengrep rule `raptor-command-injection` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
system(...)
popen(...)
```

Good:

```cpp
$FUN("...", ...)
```

## Detection hints

Literal patterns from opengrep rule `raptor-command-injection` (metavariables start with `$`):

- `system(...)`
- `popen(...)`
- `$FUN("...", ...)`
