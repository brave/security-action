---
name: client/unsafe-js-in-cpp-strings
rubric: safety
severity: should_fix
languages: [c, cpp]
cwe: [CWE-94]
---

**Rule.** Unsafe JS in CPP strings

**Why.** Reported as CWE-94: Improper Control of Generation of Code ('Code Injection'). Ported from opengrep rule `unsafe-js-in-cpp-strings` (client/unsafejs-in-cpp.yaml).

## Examples

Bad:

```cpp
innerHTML
document\.write
```

## Detection hints

Literal patterns from opengrep rule `unsafe-js-in-cpp-strings` (metavariables start with `$`):

- `innerHTML`
- `document\.write`
- `"..."`
