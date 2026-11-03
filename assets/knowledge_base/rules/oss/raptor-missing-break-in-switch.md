---
name: oss/raptor-missing-break-in-switch
rubric: safety
severity: nit
languages: [c, cpp]
---

**Rule.** The software omits a break statement within a switch or similar construct, causing code associated with multiple conditions to execute. This can cause problems when the programmer only intended to execute code associated with one condition.

**Why.** See https://cwe.mitre.org/data/definitions/484. See https://g.co/kgs/PCHQjJ. See https://github.com/struct/mms. See https://github.com/returntocorp/semgrep/issues/4939. Ported from opengrep rule `raptor-missing-break-in-switch` (generated/oss/audit.yaml).

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
switch ($VAR) { case $VAL1: ... goto $LOC; case $VAL2: ... }
switch ($VAR) { case $VAL1: goto $LOC; case $VAL2: ... }
```

## Detection hints

Literal patterns from opengrep rule `raptor-missing-break-in-switch` (metavariables start with `$`):

- `switch ($VAR) { case $VAL1: ... case $VAL2: ... }`
- `switch ($VAR) { case $VAL1: ... break; case $VAL2: ... }`
- `switch ($VAR) { case $VAL1: break; case $VAL2: ... }`
- `switch ($VAR) { case $VAL1: ... exit($RET); case $VAL2: ... }`
- `switch ($VAR) { case $VAL1: exit($RET); case $VAL2: ... }`
- `switch ($VAR) { case $VAL1: ... return; case $VAL2: ... }`
- `switch ($VAR) { case $VAL1: return; case $VAL2: ... }`
- `switch ($VAR) { case $VAL1: ... return $RET; case $VAL2: ... }`
- `switch ($VAR) { case $VAL1: return $RET; case $VAL2: ... }`
- `switch ($VAR) { case $VAL1: ... goto $LOC; case $VAL2: ... }`
- `switch ($VAR) { case $VAL1: goto $LOC; case $VAL2: ... }`
