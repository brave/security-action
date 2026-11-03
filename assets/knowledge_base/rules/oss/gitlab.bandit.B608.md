---
name: oss/gitlab.bandit.B608
rubric: safety
severity: should_fix
languages: [python]
cwe: [CWE-89]
---

**Rule.** SQL Injection is a critical vulnerability that can lead to data or system compromise. By dynamically generating SQL query strings, user input may be able to influence the logic of the SQL statement. This could lead to an adversary accessing information they should not have access to, or in some circumstances, being able to execute OS functionality or code. Replace all dynamically generated SQL queries with parameterized queries. In situations where dynamic queries must be created, never use direct user input, but instead use a map or dictionary of valid values and resolve them using a user supplied key. For example, some database drivers do not allow parameterized queries for `>` or `<` comparison operators. In these cases, do not use a user supplied `>` or `<` value, but rather have the user supply a `gt` or `lt` value. The alphabetical values are then used to look up the `>` and `<` values to be used in the construction of the dynamic query. The same goes for other queries where column or table names are required but cannot be parameterized. Example using `PreparedStatement` queries: ``` import sqlite3 # Create a new database (in memory) con = sqlite3.connect(":memory:") # Get a cursor from the connection cur = con.cursor() # Create a tuple of the value to be used in the parameterized query params = ('user-input',) # execute the statement, passing in the params for the value cur.execute("select name from sqlite_master where name = ?", params) # work with the result result = cur.fetchall() ``` For more information on SQL Injection see OWASP: https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html

**Why.** Reported as CWE-89. Ported from opengrep rule `gitlab.bandit.B608` (generated/oss/audit.yaml).

## Examples

Bad:

```python
$DB.execute("$QUERY" % ...)
$DB.execute("$QUERY".format(...))
$DB.execute(f"$QUERY")
$DB.execute("$QUERY" + ...)
$DB.execute($SQL)
```

Good:

```python
$DB.execute("...")
$DB.execute("$QUERY" % "...")
$DB.execute("$QUERY" + "...")
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B608` (metavariables start with `$`):

- `(?i)^(SELECT|INSERT|UPDATE|DELETE)\s`
- `$DB.execute("...")`
- `$DB.execute("$QUERY" % "...")`
- `$DB.execute("$QUERY" + "...")`
- `$DB.execute("$QUERY" % ...)`
- `$DB.execute("$QUERY".format(...))`
- `$DB.execute(f"$QUERY")`
- `$DB.execute("$QUERY" + ...)`
- `...
$SQL = "$QUERY" % ...
...`
- `...
$SQL = "$QUERY" + ...
...`
- `...
$TMP = "$QUERY"
...
$SQL = $TMP + "..." % ...
...`
- `...
$SQL = "$QUERY"
...
$SQL += ...
...`
- `...
$SQL = "$QUERY".format(...)
...`
- `...
$SQL = f"$QUERY"
...`
- `$DB.execute($SQL)`
