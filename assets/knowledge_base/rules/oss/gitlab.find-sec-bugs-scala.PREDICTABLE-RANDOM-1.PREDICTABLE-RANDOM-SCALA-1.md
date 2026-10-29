---
name: oss/gitlab.find-sec-bugs-scala.PREDICTABLE-RANDOM-1.PREDICTABLE-RANDOM-SCALA-1
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-330]
---

**Rule.** The use of a predictable random value can lead to vulnerabilities when used in certain security critical contexts. A quick fix could be to replace the use of scala.util.Random with something stronger, such as java.security.SecureRandom

**Why.** Reported as CWE-330. Ported from opengrep rule `gitlab.find_sec_bugs_scala.PREDICTABLE_RANDOM-1.PREDICTABLE_RANDOM_SCALA-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.PREDICTABLE_RANDOM-1.PREDICTABLE_RANDOM_SCALA-1` (metavariables start with `$`):

- `$LANG.util.Random.$METHOD`
- `^(next)`
- `Math.random`
