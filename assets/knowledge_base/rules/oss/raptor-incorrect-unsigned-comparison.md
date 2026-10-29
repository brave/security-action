---
name: oss/raptor-incorrect-unsigned-comparison
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** Checking if an unsigned variable is negative makes no sense and is usually a good indication that something is probably wrong with the code.

**Why.** See https://cwe.mitre.org/data/definitions/697. See https://g.co/kgs/PCHQjJ. Ported from opengrep rule `raptor-incorrect-unsigned-comparison` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `raptor-incorrect-unsigned-comparison` (metavariables start with `$`):

- `(unsigned short $UNSIGNED) < 0`
- `(unsigned short int $UNSIGNED) < 0`
- `(unsigned int $UNSIGNED) < 0`
- `(unsigned long $UNSIGNED) < 0`
- `(unsigned long int $UNSIGNED) < 0`
- `(size_t $UNSIGNED) < 0`
- `(unsigned short $UNSIGNED) <= 0`
- `(unsigned short int $UNSIGNED) <= 0`
- `(unsigned int $UNSIGNED) <= 0`
- `(unsigned long $UNSIGNED) <= 0`
- `(unsigned long int $UNSIGNED) <= 0`
- `(size_t $UNSIGNED) <= 0`
- `(unsigned short $UNSIGNED) >= 0`
- `(unsigned short int $UNSIGNED) >= 0`
- `(unsigned int $UNSIGNED) >= 0`
- `(unsigned long $UNSIGNED) >= 0`
- `(unsigned long int $UNSIGNED) >= 0`
- `(size_t $UNSIGNED) >= 0`
