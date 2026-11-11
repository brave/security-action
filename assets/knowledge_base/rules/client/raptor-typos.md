---
name: client/raptor-typos
rubric: safety
severity: should_fix
languages: [c, cpp]
cwe: [CWE-480]
---

**Rule.** The programmer accidentally uses the wrong operator, which changes the application logic in security-relevant ways. These types of errors are generally the result of a typo. This rule also covers some other common typo patterns. (see $EXPR1)

**Why.** Reported as CWE-480: Use of Incorrect Operator. See https://cwe.mitre.org/data/definitions/480. See https://cwe.mitre.org/data/definitions/481. See https://cwe.mitre.org/data/definitions/482. See https://cwe.mitre.org/data/definitions/483. See https://g.co/kgs/PCHQjJ. See https://www.sei.cmu.edu/downloads/sei-cert-c-coding-standard-2016-v01.pdf. Ported from opengrep rule `raptor-typos` (client/typos.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `raptor-typos` (metavariables start with `$`):

- `for ($EXPR1 == $EXPR2; $EXPR3; $EXPR4) ...`
- `if (<... $EXPR1 = $EXPR2 ...>) ...`
- `if (<... ($EXPR1 = $EXPR2) == $EXPR ...>) ...`
- `if (<... ($EXPR1 = $EXPR2) != $EXPR ...>) ...`
- `if (<... ($EXPR1 = $EXPR2) < $EXPR ...>) ...`
- `if (<... ($EXPR1 = $EXPR2) <= $EXPR ...>) ...`
- `if (<... ($EXPR1 = $EXPR2) > $EXPR ...>) ...`
- `if (<... ($EXPR1 = $EXPR2) >= $EXPR ...>) ...`
- `if\s*\(\s*[_a-zA-Z][_a-zA-Z0-9:<>]{0,40}\**\s+\**[_a-zA-Z][_a-zA-Z0-9]{0,30}\s*`
- `if\s*\(\s*[_a-zA-Z][_a-zA-Z0-9*:]{0,40}<[_a-zA-Z][_a-zA-Z0-9:]{0,30}>\s*`
- `$EXPR1 =+ $EXPR2`
- `if ($COND);`
- `for ($EXPR1; $EXPR2; $EXPR3);`
- `$TYPE $ARR[$SIZE];`
- `$TYPE $ARR[$SIZE] = $EXPR;`
- `^0.*`
