---
name: oss/raptor-unchecked-ret-scanf-etc
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** The software does not check the return value from a method or function, which can prevent it from detecting unexpected states and conditions.

**Why.** See https://cwe.mitre.org/data/definitions/252. See https://codeql.github.com/codeql-query-help/cpp/cpp-missing-check-scanf/. Ported from opengrep rule `raptor-unchecked-ret-scanf-etc` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
$FUN(...)
scanf
vscanf
fscanf
vfscanf
sscanf
vsscanf
wscanf
vwscanf
fwscanf
vfwscanf
swscanf
vswscanf
```

Good:

```cpp
$RET = $FUN(...)
<... $FUN(...) == $VAL ...>
<... $VAL == $FUN(...) ...>
<... $FUN(...) != $VAL ...>
<... $VAL != $FUN(...) ...>
<... $FUN(...) < $VAL ...>
<... $VAL > $FUN(...) ...>
<... $FUN(...) <= $VAL ...>
<... $VAL >= $FUN(...) ...>
<... $FUN(...) > $VAL ...>
<... $VAL < $FUN(...) ...>
<... $FUN(...) >= $VAL ...>
<... $VAL <= $FUN(...) ...>
return $FUN(...);
```

## Detection hints

Literal patterns from opengrep rule `raptor-unchecked-ret-scanf-etc` (metavariables start with `$`):

- `$FUN(...)`
- `scanf`
- `vscanf`
- `fscanf`
- `vfscanf`
- `sscanf`
- `vsscanf`
- `wscanf`
- `vwscanf`
- `fwscanf`
- `vfwscanf`
- `swscanf`
- `vswscanf`
- `$RET = $FUN(...)`
- `<... $FUN(...) == $VAL ...>`
- `<... $VAL == $FUN(...) ...>`
- `<... $FUN(...) != $VAL ...>`
- `<... $VAL != $FUN(...) ...>`
- `<... $FUN(...) < $VAL ...>`
- `<... $VAL > $FUN(...) ...>`
- `<... $FUN(...) <= $VAL ...>`
- `<... $VAL >= $FUN(...) ...>`
- `<... $FUN(...) > $VAL ...>`
- `<... $VAL < $FUN(...) ...>`
- `<... $FUN(...) >= $VAL ...>`
- `<... $VAL <= $FUN(...) ...>`
- `return $FUN(...);`
