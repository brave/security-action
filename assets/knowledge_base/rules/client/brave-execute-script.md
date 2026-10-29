---
name: client/brave-execute-script
rubric: safety
severity: nit
languages: [cpp]
---

**Rule.** $FUNC usages should be vet by the security-team. References: - https://github.com/brave/brave-browser/wiki/Security-reviews (point 12)

**Why.** Reported as CWE-94: Improper Control of Generation of Code ('Code Injection'). See https://github.com/brave/brave-browser/wiki/Security-reviews. Ported from opengrep rule `brave-execute-script` (client/brave-execute-script.yaml).

## Examples

Bad:

```cpp
$OBJ.$FUNC(...)
```

## Detection hints

Literal patterns from opengrep rule `brave-execute-script` (metavariables start with `$`):

- `$OBJ.$FUNC(...)`
- `^(.*ExecuteScript.*|ExecuteMethodAndReturnValue|CallFunctionEvenIfScriptDisabled|ExecuteJavaScript)$`
