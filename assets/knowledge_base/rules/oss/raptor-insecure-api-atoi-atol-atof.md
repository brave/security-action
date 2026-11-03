---
name: oss/raptor-insecure-api-atoi-atol-atof
rubric: safety
severity: nit
languages: [c, cpp]
---

**Rule.** The atoi(), atol(), atof(), and similar functions don't handle errors. They don't check for integer overflow and can return a negative value. They have undefined behavior if the value of the result cannot be represented. They return 0 (or 0.0) if the string does not represent an integer (or decimal), which is indistinguishable from a correctly formatted, zero-denoting input string.

**Why.** See https://rules.sonarsource.com/c/type/Bug/RSPEC-989. See https://wiki.sei.cmu.edu/confluence/display/c/ERR34-C.+Detect+errors+when+converting+a+string+to+a+number. Ported from opengrep rule `raptor-insecure-api-atoi-atol-atof` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `raptor-insecure-api-atoi-atol-atof` (metavariables start with `$`):

- `atoi(...)`
- `atol(...)`
- `atof(...)`
- `atoll(...)`
