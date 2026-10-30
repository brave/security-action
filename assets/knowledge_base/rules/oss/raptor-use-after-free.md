---
name: oss/raptor-use-after-free
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** The use of previously-freed memory can have any number of adverse consequences, ranging from the corruption of valid data to the execution of arbitrary code, depending on the instantiation and timing of the flaw. The simplest way data corruption may occur involves the system's reuse of the freed memory.

**Why.** See https://cwe.mitre.org/data/definitions/416. See https://github.com/struct/mms. See https://www.sei.cmu.edu/downloads/sei-cert-c-coding-standard-2016-v01.pdf. See https://docs.microsoft.com/en-us/cpp/sanitizers/asan-error-examples. Ported from opengrep rule `raptor-use-after-free` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
$PTR->$MEM
$PTR[$POS]
(*$PTR)
return $PTR;
$FUN(..., <... $PTR ...>, ...)
$FUN(..., <... $PTR->$MEM ...>, ...)
$FUN(..., <... $PTR[$POS] ...>, ...)
$FUN(..., <... (*$PTR) ...>, ...)
$PTR->$FUN(...)
```

Good:

```cpp
free
free($PTR);
...
$PTR = $EXPR; 
...
```

## Detection hints

Literal patterns from opengrep rule `raptor-use-after-free` (metavariables start with `$`):

- `$PTR->$MEM`
- `$PTR[$POS]`
- `(*$PTR)`
- `return $PTR;`
- `$FUN(..., <... $PTR ...>, ...)`
- `$FUN(..., <... $PTR->$MEM ...>, ...)`
- `$FUN(..., <... $PTR[$POS] ...>, ...)`
- `$FUN(..., <... (*$PTR) ...>, ...)`
- `$PTR->$FUN(...)`
- `free`
- `free($PTR); ...`
- `free($PTR);
...
$PTR = $EXPR; 
...`
