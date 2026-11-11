---
name: client/chromium-security-dcheck-should-be-check
rubric: safety
severity: should_fix
languages: [cpp, c]
---

**Rule.** DCHECK() should not be used for security-critical invariants that must be verified in production. Use CHECK() instead to ensure the invariant is always verified, not just in debug builds. Common security-critical patterns: origin validation, bounds checking, privilege verification.

**Why.** See https://chromium.googlesource.com/chromium/src/+/main/styleguide/c++/checks.md. See https://chromium.googlesource.com/chromium/src/+/main/styleguide/c++/c++.md#CHECK_DCHECK_and_NOTREACHED. Ported from opengrep rule `chromium-security-dcheck-should-be-check` (client/check-vs-dcheck.yaml).

## Examples

Bad:

```cpp
DCHECK($CONDITION);
DCHECK_EQ(..., $CONDITION);
DCHECK_EQ($CONDITION, ...);
DCHECK_NE($CONDITION, ...);
DCHECK_NE(..., $CONDITION);
DCHECK_LT($CONDITION, ...);
DCHECK_LT(..., $CONDITION);
DCHECK_LE(..., $CONDITION);
DCHECK_LE($CONDITION, ...);
DCHECK_GT(..., $CONDITION);
DCHECK_GT($CONDITION, ...);
DCHECK_GE(..., $CONDITION);
DCHECK_GE($CONDITION, ...);
```

## Detection hints

Literal patterns from opengrep rule `chromium-security-dcheck-should-be-check` (metavariables start with `$`):

- `DCHECK($CONDITION);`
- `DCHECK_EQ(..., $CONDITION);`
- `DCHECK_EQ($CONDITION, ...);`
- `DCHECK_NE($CONDITION, ...);`
- `DCHECK_NE(..., $CONDITION);`
- `DCHECK_LT($CONDITION, ...);`
- `DCHECK_LT(..., $CONDITION);`
- `DCHECK_LE(..., $CONDITION);`
- `DCHECK_LE($CONDITION, ...);`
- `DCHECK_GT(..., $CONDITION);`
- `DCHECK_GT($CONDITION, ...);`
- `DCHECK_GE(..., $CONDITION);`
- `DCHECK_GE($CONDITION, ...);`
- `.*(origin|security|privilege|auth|permission|bound|size|index|offset|length|capacity).*`
