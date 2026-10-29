---
name: services/activerecord-sanitize-sql-noop
rubric: safety
severity: nit
languages: [ruby]
cwe: [CWE-89]
---

**Rule.** When $FUNC is called with a string argument rather than an array/hash, it returns the string as-is without sanitization. The method name is dangerously misleading. The method's intended use is to safely insert variables into a string containing '?' or ':param', producing a valid SQL fragment for use where parameterized queries will not work. This method will NOT sanitize just a SQL string. User input here is likely a SQL injection vulnerability.

**Why.** Reported as CWE-89: Improper Neutralization of Special Elements used in an SQL Command ('SQL Injection'). See https://api.rubyonrails.org/classes/ActiveRecord/Sanitization/ClassMethods.html. Ported from opengrep rule `activerecord-sanitize-sql-noop` (services/activerecord-sanitize-sql-noop.yaml).

## Examples

Bad:

```text
ActiveRecord::Base.$FUNC($STR)
$FUNC($STR)
```

## Detection hints

Literal patterns from opengrep rule `activerecord-sanitize-sql-noop` (metavariables start with `$`):

- `ActiveRecord::Base.$FUNC($STR)`
- `$FUNC($STR)`
- `^[^[]`
- `^sanitize_sql(_for_(order|conditions))?$`
