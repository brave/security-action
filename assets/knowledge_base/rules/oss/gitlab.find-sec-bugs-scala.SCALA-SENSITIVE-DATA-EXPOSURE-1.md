---
name: oss/gitlab.find-sec-bugs-scala.SCALA-SENSITIVE-DATA-EXPOSURE-1
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-200]
---

**Rule.** Applications can unintentionally leak information about their configuration, internal workings, or violate privacy through a variety of application problems. Pages that provide different responses based on the validity of the data can lead to Information Leakage; specifically when data deemed confidential is being revealed as a result of the web application's design.

**Why.** Reported as CWE-200. Ported from opengrep rule `gitlab.find_sec_bugs_scala.SCALA_SENSITIVE_DATA_EXPOSURE-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
Ok(<...$VAL...>)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.SCALA_SENSITIVE_DATA_EXPOSURE-1` (metavariables start with `$`):

- `def $FUNC(..., $ARG: String, ...) = $TYPE {
  ...
}`
- `$VAL = ($C: play.api.Configuration).underlying.getString($ARG)
...`
- `Ok(<...$VAL...>)`
