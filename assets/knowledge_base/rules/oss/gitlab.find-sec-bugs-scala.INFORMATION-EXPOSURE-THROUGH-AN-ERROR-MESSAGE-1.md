---
name: oss/gitlab.find-sec-bugs-scala.INFORMATION-EXPOSURE-THROUGH-AN-ERROR-MESSAGE-1
rubric: safety
severity: should_fix
languages: [scala]
---

**Rule.** The sensitive information may be valuable information on its own (such as a password), or it may be useful for launching other, more deadly attacks. If an attack fails, an attacker may use error information provided by the server to launch another more focused attack. For example, an attempt to exploit a path traversal weakness (CWE-22) might yield the full pathname of the installed application.

**Why.** Reported as CWE-209. Ported from opengrep rule `gitlab.find_sec_bugs_scala.INFORMATION_EXPOSURE_THROUGH_AN_ERROR_MESSAGE-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
$E.printStackTrace(...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.INFORMATION_EXPOSURE_THROUGH_AN_ERROR_MESSAGE-1` (metavariables start with `$`):

- `$E.printStackTrace(...)`
