---
name: oss/raptor-unchecked-ret-setuid-seteuid
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** The software does not check the return value from a method or function, which can prevent it from detecting unexpected states and conditions. If the program calls a function to drop privileges but does not check the return code to ensure that privileges were successfully dropped, then the program will continue to operate with the higher privileges.

**Why.** See https://cwe.mitre.org/data/definitions/252. See https://lwn.net/Articles/451985/. See https://www.usenix.org/legacy/events/sec02/full_papers/chen/chen.pdf. See https://www.openwall.com/lists/oss-security/2023/12/30/4. Ported from opengrep rule `raptor-unchecked-ret-setuid-seteuid` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
$FUN(...)
setuid
seteuid
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
<... !$FUN(...) ...>
return $FUN(...);
```

## Detection hints

Literal patterns from opengrep rule `raptor-unchecked-ret-setuid-seteuid` (metavariables start with `$`):

- `$FUN(...)`
- `setuid`
- `seteuid`
- `$RET = $FUN(...)`
- `<... $FUN(...) == $VAL ...>`
- `<... $VAL == $FUN(...) ...>`
- `<... $FUN(...) != $VAL ...>`
- `<... $VAL != $FUN(...) ...>`
- `<... $FUN(...) < $VAL ...>`
- `<... $VAL > $FUN(...) ...>`
- `<... !$FUN(...) ...>`
- `return $FUN(...);`
