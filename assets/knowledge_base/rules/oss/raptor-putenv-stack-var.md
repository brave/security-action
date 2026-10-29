---
name: oss/raptor-putenv-stack-var
rubric: safety
severity: nit
languages: [c, cpp]
---

**Rule.** The software calls putenv() with a variable that has a short lifetime, such as a pointer to an automatic variable allocated on the stack. The correct behavior is to call putenv() with a static/global string.

**Why.** See https://cwe.mitre.org/data/definitions/686. See https://cwe.mitre.org/data/definitions/562. See https://www.sei.cmu.edu/downloads/sei-cert-c-coding-standard-2016-v01.pdf. Ported from opengrep rule `raptor-putenv-stack-var` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
putenv($PTR);
```

## Detection hints

Literal patterns from opengrep rule `raptor-putenv-stack-var` (metavariables start with `$`):

- `putenv($PTR);`
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
