---
name: client/brave-missing-break-in-switch
rubric: safety
severity: nit
languages: [c, cpp]
---

**Rule.** The software omits a break statement within a switch or similar construct, causing code associated with multiple conditions to execute. This can cause problems when the programmer only intended to execute code associated with one condition.

**Why.** Reported as CWE-484: Omitted Break Statement in Switch. See https://cwe.mitre.org/data/definitions/484. See https://g.co/kgs/PCHQjJ. See https://github.com/struct/mms. See https://github.com/returntocorp/semgrep/issues/4939. Ported from opengrep rule `brave-missing-break-in-switch` (client/brave-missing-break-in-switch.yaml).

## Examples

Bad:

```cpp
switch ($VAR) { case $VAL1: ... case $VAL2: ... }
```

Good:

```cpp
switch ($VAR) { case $VAL1: ... break; case $VAL2: ... }
switch ($VAR) { case $VAL1: break; case $VAL2: ... }
switch ($VAR) { case $VAL1: ... exit($RET); case $VAL2: ... }
switch ($VAR) { case $VAL1: exit($RET); case $VAL2: ... }
switch ($VAR) { case $VAL1: ... return; case $VAL2: ... }
switch ($VAR) { case $VAL1: return; case $VAL2: ... }
switch ($VAR) { case $VAL1: ... return $RET; case $VAL2: ... }
switch ($VAR) { case $VAL1: return $RET; case $VAL2: ... }
switch ($VAR) { case $VAL1: ... ABSL_FALLTHROUGH_INTENDED; case $VAL2: ... }
switch ($VAR) { case $VAL1: ABSL_FALLTHROUGH_INTENDED; case $VAL2: ... }
switch ($VAR) { case $VAL1: NOTREACHED_NORETURN(); case $VAL2: ... }
switch ($VAR) { case $VAL1: ... NOTREACHED_NORETURN(); case $VAL2: ... }
switch ($VAR) { case $VAL1: NOTREACHED_IN_MIGRATION(); case $VAL2: ... }
switch ($VAR) { case $VAL1: ... NOTREACHED_IN_MIGRATION(); case $VAL2: ... }
switch ($VAR) { case $VAL1: NOTREACHED(); case $VAL2: ... }
switch ($VAR) { case $VAL1: ... NOTREACHED(); case $VAL2: ... }
\[\[fallthrough\]\];
```

## Detection hints

Literal patterns from opengrep rule `brave-missing-break-in-switch` (metavariables start with `$`):

- `switch ($VAR) { case $VAL1: ... case $VAL2: ... }`
- `switch ($VAR) { case $VAL1: ... break; case $VAL2: ... }`
- `switch ($VAR) { case $VAL1: break; case $VAL2: ... }`
- `switch ($VAR) { case $VAL1: ... exit($RET); case $VAL2: ... }`
- `switch ($VAR) { case $VAL1: exit($RET); case $VAL2: ... }`
- `switch ($VAR) { case $VAL1: ... return; case $VAL2: ... }`
- `switch ($VAR) { case $VAL1: return; case $VAL2: ... }`
- `switch ($VAR) { case $VAL1: ... return $RET; case $VAL2: ... }`
- `switch ($VAR) { case $VAL1: return $RET; case $VAL2: ... }`
- `switch ($VAR) { case $VAL1: ... ABSL_FALLTHROUGH_INTENDED; case $VAL2: ... }`
- `switch ($VAR) { case $VAL1: ABSL_FALLTHROUGH_INTENDED; case $VAL2: ... }`
- `switch ($VAR) { case $VAL1: NOTREACHED_NORETURN(); case $VAL2: ... }`
- `switch ($VAR) { case $VAL1: ... NOTREACHED_NORETURN(); case $VAL2: ... }`
- `switch ($VAR) { case $VAL1: NOTREACHED_IN_MIGRATION(); case $VAL2: ... }`
- `switch ($VAR) { case $VAL1: ... NOTREACHED_IN_MIGRATION(); case $VAL2: ... }`
- `switch ($VAR) { case $VAL1: NOTREACHED(); case $VAL2: ... }`
- `switch ($VAR) { case $VAL1: ... NOTREACHED(); case $VAL2: ... }`
- `\[\[fallthrough\]\];`
