---
name: oss/raptor-suspicious-assert
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** Most codebases define assertion macros which compile to a no-op on non-debug builds. If assertions are the only line of defense against untrusted input, the software may be exposed to attacks that leverage the lack of proper input checks.

**Why.** See https://legends2k.github.io/note/assert_vs_if/. See https://github.com/struct/mms. Ported from opengrep rule `raptor-suspicious-assert` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
$ASSERT(..., <... $A < $B ...>, ...)
$ASSERT(..., <... $A <= $B ...>, ...)
$ASSERT(..., <... $A > $B ...>, ...)
$ASSERT(..., <... $A >= $B ...>, ...)
```

## Detection hints

Literal patterns from opengrep rule `raptor-suspicious-assert` (metavariables start with `$`):

- `$ASSERT(..., <... $A < $B ...>, ...)`
- `$ASSERT(..., <... $A <= $B ...>, ...)`
- `$ASSERT(..., <... $A > $B ...>, ...)`
- `$ASSERT(..., <... $A >= $B ...>, ...)`
- `(?i)^\w*assert\w*\s*$`
