---
name: client/chromium-bind-uaf
rubric: safety
severity: should_fix
languages: [cpp, c]
cwe: [CWE-416]
---

**Rule.** BindOnce/BindRepeating may allow callers to access objects which may already be freed in the C++ lifecycle.<br/>Verify the occurrences manually.

**Why.** Reported as CWE-416: Use After Free. Ported from opengrep rule `chromium-bind-uaf` (client/chromium-bind-uaf.yaml).

## Examples

Bad:

```cpp
base::BindOnce($FIRST_ARG, $...REST_ARGS)
base::BindRepeating($FIRST_ARG, $...REST_ARGS)
```

## Detection hints

Literal patterns from opengrep rule `chromium-bind-uaf` (metavariables start with `$`):

- `base::BindOnce($FIRST_ARG, $...REST_ARGS)`
- `base::BindRepeating($FIRST_ARG, $...REST_ARGS)`
