---
name: oss/raptor-ret-stack-address
rubric: safety
severity: nit
languages: [c, cpp]
---

**Rule.** A function returns the address of a stack variable, which will cause unintended program behavior, typically in the form of a crash.

**Why.** See https://cwe.mitre.org/data/definitions/562. See https://github.com/struct/mms. See https://www.sei.cmu.edu/downloads/sei-cert-c-coding-standard-2016-v01.pdf. See https://docs.microsoft.com/en-us/cpp/sanitizers/asan-error-examples. See https://rules.sonarsource.com/c/type/Bug/RSPEC-946. Ported from opengrep rule `raptor-ret-stack-address` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `raptor-ret-stack-address` (metavariables start with `$`):

- `return $PTR;`
- `$TYPE $PTR[$LEN];
...`
- `$TYPE $PTR[$LEN] = $EXPR;
...`
- `$TYPE $ARR[$LEN];
...
$PTR = $ARR;
...`
- `$TYPE $ARR[$LEN] = $EXPR;
...
$PTR = $ARR;
...`
- `return &$VAR;`
- `$TYPE $VAR;
...`
- `$TYPE $VAR = $EXPR;
...`
- `$TYPE $VAR[$LEN];
...`
- `$TYPE $VAR[$LEN] = $EXPR;
...`
- `$TYPE * $VAR;
...`
- `$TYPE * $VAR = $EXPR;
...`
