---
name: oss/gitlab.flawfinder.syslog-1
rubric: safety
severity: should_fix
languages: [c, cpp]
cwe: [CWE-134]
---

**Rule.** Format string vulnerabilities allow an attacker to read or in some cases, potentially write data to and from locations in the processes' memory. To prevent against format string attacks, do not allow users or un-validated input to provide the format specification. Consider using a constant for the format specification, or strip all format specifiers from the input prior to calling the `syslog` function. For more information please see: https://capec.mitre.org/data/definitions/67.html

**Why.** Reported as CWE-134. Ported from opengrep rule `gitlab.flawfinder.syslog-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.syslog-1` (metavariables start with `$`):

- `syslog($FUNC,...)`
- `syslog($FUNC,"...",...)`
