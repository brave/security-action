---
name: oss/raptor-double-free
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** The software calls free() twice on the same memory address, potentially leading to memory corruption. This corruption can cause the program to crash or cause two later calls to malloc() to return the same pointer.

**Why.** See https://cwe.mitre.org/data/definitions/415. See https://github.com/struct/mms. See https://www.sei.cmu.edu/downloads/sei-cert-c-coding-standard-2016-v01.pdf. See https://docs.microsoft.com/en-us/cpp/sanitizers/asan-error-examples. See https://dustri.org/b/playing-with-weggli.html. Ported from opengrep rule `raptor-double-free` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
free($PTR);
...
$FREE($PTR);
free
```

Good:

```cpp
free($PTR);
...
$PTR = $EXPR;
...
free($PTR);
```

## Detection hints

Literal patterns from opengrep rule `raptor-double-free` (metavariables start with `$`):

- `free($PTR);
...
$FREE($PTR);`
- `free($PTR);
...
$PTR = $EXPR;
...
free($PTR);`
- `free`
