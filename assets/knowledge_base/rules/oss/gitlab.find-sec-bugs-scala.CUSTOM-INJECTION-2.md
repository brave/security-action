---
name: oss/gitlab.find-sec-bugs-scala.CUSTOM-INJECTION-2
rubric: safety
severity: should_fix
languages: [scala]
---

**Rule.** The method identified is susceptible to injection. The input should be validated and properly escaped.

**Why.** Reported as CWE-89. Ported from opengrep rule `gitlab.find_sec_bugs_scala.CUSTOM_INJECTION-2` (generated/oss/audit.yaml).

## Examples

Bad:

```text
"$SQL_STR" + $SQLIN
String.format("$SQL_STR", ... + $SQLIN + ...)
"$SQL_STR".concat(...)
(StringBuilder $BUILDER). ... .append("$SQL_STR")
$BUILDER.append(...)
$QUERY += ...
```

Good:

```text
$BUILDER.append("...")
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.CUSTOM_INJECTION-2` (metavariables start with `$`):

- `def $FOO(..., $SQLIN: String, ...): $TYPE = {
  ...
}`
- `"$SQL_STR" + $SQLIN`
- `String.format("$SQL_STR", ... + $SQLIN + ...)`
- `"$SQL_STR".concat(...)`
- `(StringBuilder $BUILDER). ... .append("$SQL_STR")`
- `StringBuilder $BUILDER = new StringBuilder(... + "$SQL_STR" + ...);
...`
- `$BUILDER.append(...)`
- `$BUILDER.append("...")`
- `$QUERY = "$SQL_STR";
...`
- `$QUERY += ...`
- `(?i)(select|insert|create|update|alter|delete|drop)\b`
