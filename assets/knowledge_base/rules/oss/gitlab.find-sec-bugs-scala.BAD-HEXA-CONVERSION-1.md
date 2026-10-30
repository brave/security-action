---
name: oss/gitlab.find-sec-bugs-scala.BAD-HEXA-CONVERSION-1
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-704]
---

**Rule.** When converting a byte array containing a hash signature to a human readable string, a conversion mistake can be made if the array is read byte by byte.

**Why.** Reported as CWE-704. Ported from opengrep rule `gitlab.find_sec_bugs_scala.BAD_HEXA_CONVERSION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.BAD_HEXA_CONVERSION-1` (metavariables start with `$`):

- `$B_ARR = ($MD: java.security.MessageDigest).digest(...);
...
for(...) {
  ...
  Integer.toHexString(...);
}`
- `$B_ARR = ($MD: java.security.MessageDigest).digest(...);
...
while(...) {
  ...
  Integer.toHexString(...);
}`
