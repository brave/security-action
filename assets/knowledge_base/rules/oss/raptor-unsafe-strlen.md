---
name: oss/raptor-unsafe-strlen
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** The software performs a calculation that can produce an integer overflow or wraparound, when the logic assumes that the resulting value will always be larger than the original value. This can introduce other weaknesses when the calculation is used for resource management or execution control. When influenced by the size of an input it is often easier to overflow a short than an int.

**Why.** See https://cwe.mitre.org/data/definitions/190. See https://cwe.mitre.org/data/definitions/680. See https://github.com/struct/mms. Ported from opengrep rule `raptor-unsafe-strlen` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `raptor-unsafe-strlen` (metavariables start with `$`):

- `(short $LEN) = strlen(...);`
- `(short int $LEN) = strlen(...);`
- `(unsigned short $LEN) = strlen(...);`
- `(unsigned short int $LEN) = strlen(...);`
- `(short $LEN) = wcslen(...);`
- `(short int $LEN) = wcslen(...);`
- `(unsigned short $LEN) = wcslen(...);`
- `(unsigned short int $LEN) = wcslen(...);`
