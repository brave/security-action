---
name: services/not-using-hasownproperty-proto-access
rubric: safety
severity: should_fix
languages: [js, ts]
---

**Rule.** This allows $X to be `__proto__` or `toString`. To prevent prototype access use Object.prototype.hasOwnProperty.call($OBJ, $X) or use a Map.

**Why.** Reported as CWE-1321: Improperly Controlled Modification of Object Prototype Attributes ('Prototype Pollution'). See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty. Ported from opengrep rule `not-using-hasownproperty-proto-access` (services/not-using-hasownproperty-proto-access.yaml).

## Examples

Bad:

```javascript
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `not-using-hasownproperty-proto-access` (metavariables start with `$`):

- `if ($X in $OBJ) {
    ...
    $OBJ[$X]
    ...
}`
