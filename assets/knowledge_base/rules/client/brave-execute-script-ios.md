---
name: client/brave-execute-script-ios
rubric: safety
severity: nit
languages: [swift]
---

**Rule.** $FUNC usages should be vet by the security-team. References: - https://github.com/brave/brave-browser/wiki/Security-reviews (point 13)

**Why.** Reported as CWE-94: Improper Control of Generation of Code ('Code Injection'). See https://github.com/brave/brave-browser/wiki/Security-reviews. Ported from opengrep rule `brave-execute-script-ios` (client/brave-execute-script-ios.yaml).

## Examples

Bad:

```text
$OBJ.$FUNC(...)
$FUNC(...)
```

## Detection hints

Literal patterns from opengrep rule `brave-execute-script-ios` (metavariables start with `$`):

- `$OBJ.$FUNC(...)`
- `$FUNC(...)`
- `^(WKUserScript|evaluateSafeJavaScriptThrowing|evaluateSafeJavaScript|evaluateJavaScript)$`
