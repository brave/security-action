---
name: oss/gitlab.find-sec-bugs-scala.CUSTOM-INJECTION-1
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-89]
---

**Rule.** The method identified is susceptible to injection. The input should be validated and properly escaped.

**Why.** Reported as CWE-89. Ported from opengrep rule `gitlab.find_sec_bugs_scala.CUSTOM_INJECTION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
val $QUERY = ... + $VAR + ...
...
$ST.executeQuery($QUERY)
val $QUERY = ... + $VAR
...
$ST.executeQuery($QUERY)
val $QUERY = String.format("...",...,$VAR,...)
...
$ST.executeQuery($QUERY)
$ST.executeQuery(($SB: StringBuilder).toString())
$ST.executeQuery(... + $VAR + ...)
$ST.executeQuery(... + $VAR)
$ST.executeQuery(...,String.format("...",...,$VAR,...), ...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.CUSTOM_INJECTION-1` (metavariables start with `$`):

- `val $ST = connection.createStatement
...`
- `val $QUERY = ... + $VAR + ...
...
$ST.executeQuery($QUERY)`
- `val $QUERY = ... + $VAR
...
$ST.executeQuery($QUERY)`
- `val $QUERY = String.format("...",...,$VAR,...)
...
$ST.executeQuery($QUERY)`
- `$ST.executeQuery(($SB: StringBuilder).toString())`
- `$ST.executeQuery(... + $VAR + ...)`
- `$ST.executeQuery(... + $VAR)`
- `$ST.executeQuery(...,String.format("...",...,$VAR,...), ...)`
