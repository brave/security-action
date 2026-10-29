---
name: oss/gitlab.find-sec-bugs-kotlin.BAD-HEXA-CONVERSION-1
rubric: safety
severity: should_fix
languages: [kotlin]
---

**Rule.** When converting a byte array containing a hash signature to a human readable string, a conversion mistake can be made if the array is read byte by byte.

**Why.** Reported as CWE-704. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.BAD_HEXA_CONVERSION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
for($B in $B_ARR) {
  ...
  $B_TOSTR
}
while(...) {
  ...
  $B_TOSTR
}
do {
  ...
  $B_TOSTR
} while(...)
java.lang.Integer.toHexString($B_TOINT)
Integer.toHexString($B_TOINT)
$B_TOINT.toHexString(...)
$B_ARR[...].toInt()
$B_ARR[...]
$B.toInt()
$B
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.BAD_HEXA_CONVERSION-1` (metavariables start with `$`):

- `$B_ARR = ($MD: java.security.MessageDigest).digest(...);
...`
- `for($B in $B_ARR) {
  ...
  $B_TOSTR
}`
- `while(...) {
  ...
  $B_TOSTR
}`
- `do {
  ...
  $B_TOSTR
} while(...)`
- `java.lang.Integer.toHexString($B_TOINT)`
- `Integer.toHexString($B_TOINT)`
- `$B_TOINT.toHexString(...)`
- `$B_ARR[...].toInt()`
- `$B_ARR[...]`
- `$B.toInt()`
- `$B`
