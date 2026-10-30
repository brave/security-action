---
name: client/cast-signed-to-unsigned
rubric: safety
severity: should_fix
languages: [cpp, c]
cwe: [CWE-195]
---

**Rule.** Semgrep found a cast from $TYPE (signed) to $CAST. For arithmetic use `base::CheckAdd(value1, value2).AssignIfValid(&result)`. In case casting the value is required, consider using `base::checked_cast`, or if your want to fail without a check `IsValueInRangeForNumericType`. References: - https://chromium.googlesource.com/chromium/src/+/main/docs/security/integer-semantics.md#be-aware-of-the-subtleties-of-integer-types - https://chromium.googlesource.com/chromium/src/+/main/base/numerics/README.md - https://google.github.io/styleguide/cppguide.html#Casting - https://chromium.googlesource.com/chromium/src/+/main/styleguide/c++/c++.md

**Why.** Reported as CWE-195: Signed to Unsigned Conversion Error. Ported from opengrep rule `cast-signed-to-unsigned` (client/cast-signed-to-unsigned.yaml).

## Examples

Bad:

```cpp
($CAST)($TYPE $X)
```

## Detection hints

Literal patterns from opengrep rule `cast-signed-to-unsigned` (metavariables start with `$`):

- `($CAST)($TYPE $X)`
- `^(u.*)$`
- `^([^u].*)$`
