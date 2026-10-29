---
name: oss/gitlab.find-sec-bugs.CUSTOM-INJECTION-2
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** The method identified is susceptible to injection. The input should be validated and properly escaped.

**Why.** Reported as CWE-89. Ported from opengrep rule `gitlab.find_sec_bugs.CUSTOM_INJECTION-2` (generated/oss/audit.yaml).

## Examples

Bad:

```java
"$SQL_STR" + ...
String.format("$SQL_STR", ...)
"$SQL_STR".concat(...)
(StringBuilder $BUILDER). ... .append("$SQL_STR")
$BUILDER.append(...)
$QUERY += ...
```

Good:

```java
final String $VAR = ...;
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.CUSTOM_INJECTION-2` (metavariables start with `$`):

- `final String $VAR = ...;`
- `"$SQL_STR" + ...`
- `String.format("$SQL_STR", ...)`
- `"$SQL_STR".concat(...)`
- `(StringBuilder $BUILDER). ... .append("$SQL_STR")`
- `StringBuilder $BUILDER = new StringBuilder("$SQL_STR");
...`
- `$BUILDER.append(...)`
- `$QUERY = "$SQL_STR";
...`
- `$QUERY += ...`
- `(?i)(select|insert|create|update|alter|delete|drop)\b`
