---
name: oss/raptor-typos
rubric: safety
severity: nit
languages: [c, cpp]
---

**Rule.** The programmer accidentally uses the wrong operator, which changes the application logic in security-relevant ways. This rule also covers some other common typo patterns.

**Why.** See https://cwe.mitre.org/data/definitions/480. See https://cwe.mitre.org/data/definitions/481. See https://cwe.mitre.org/data/definitions/482. See https://cwe.mitre.org/data/definitions/483. See https://g.co/kgs/PCHQjJ. See https://www.sei.cmu.edu/downloads/sei-cert-c-coding-standard-2016-v01.pdf. Ported from opengrep rule `raptor-typos` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `raptor-typos` (metavariables start with `$`):

- `for ($EXPR1 == $EXPR2; $EXPR3; $EXPR4) ...`
- `$EXPR1 == $EXPR2;`
- `return $EXPR;`
- `assert(...);`
- `if (<... $EXPR1 = $EXPR2 ...>) ...`
- `if (<... ($EXPR1 = $EXPR2) == $EXPR ...>) ...`
- `if (<... ($EXPR1 = $EXPR2) != $EXPR ...>) ...`
- `if (<... ($EXPR1 = $EXPR2) < $EXPR ...>) ...`
- `if (<... ($EXPR1 = $EXPR2) <= $EXPR ...>) ...`
- `if (<... ($EXPR1 = $EXPR2) > $EXPR ...>) ...`
- `if (<... ($EXPR1 = $EXPR2) >= $EXPR ...>) ...`
- `if (<... $EXPR1 & $EXPR2 ...>) ...`
- `if (<... ($EXPR1 & $EXPR2) == $EXPR ...>) ...`
- `if (<... ($EXPR1 & $EXPR2) != $EXPR ...>) ...`
- `if (<... ($EXPR1 & $EXPR2) < $EXPR ...>) ...`
- `if (<... ($EXPR1 & $EXPR2) <= $EXPR ...>) ...`
- `if (<... ($EXPR1 & $EXPR2) > $EXPR ...>) ...`
- `if (<... ($EXPR1 & $EXPR2) >= $EXPR ...>) ...`
- `if (<... $EXPR1 | $EXPR2 ...>) ...`
- `if (<... ($EXPR1 | $EXPR2) == $EXPR ...>) ...`
- `if (<... ($EXPR1 | $EXPR2) != $EXPR ...>) ...`
- `if (<... ($EXPR1 | $EXPR2) < $EXPR ...>) ...`
- `if (<... ($EXPR1 | $EXPR2) <= $EXPR ...>) ...`
- `if (<... ($EXPR1 | $EXPR2) > $EXPR ...>) ...`
- `if (<... ($EXPR1 | $EXPR2) >= $EXPR ...>) ...`
- `$EXPR1 =+ $EXPR2`
- `($EXPR && $EXPR)`
- `($EXPR || $EXPR)`
- `($EXPR == $EXPR)`
- `($EXPR != $EXPR)`
- `($EXPR < $EXPR)`
- `($EXPR <= $EXPR)`
- `($EXPR > $EXPR)`
- `($EXPR >= $EXPR)`
- `(char * $PTR) = '\0'`
- `(char * $PTR) == '\0'`
- `(char * $PTR) != '\0'`
- `if (<... strcpy(...) ...>) ...`
- `if (<... strncpy(...) ...>) ...`
- `if ($COND);`
- `for ($EXPR1; $EXPR2; $EXPR3);`
- `$TYPE $ARR[$LEN];`
- `$TYPE $ARR[$LEN] = $EXPR;`
- `^0[^xX].*`
