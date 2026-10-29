---
name: oss/gitlab.bandit.B611-1
rubric: safety
severity: should_fix
languages: [python]
---

**Rule.** SQL Injections are a critical type of vulnerability that can lead to data or system compromise. By dynamically generating SQL query strings, user input may be able to influence the logic of the SQL statement. This could lead to an adversary accessing information they should not have access to, or in some circumstances, being able to execute OS functionality or code. Replace all dynamically generated SQL queries with parameterized queries. In situations where dynamic queries must be created, never use direct user input, but instead use a map or dictionary of valid values and resolve them using a user supplied key. For example, some database drivers do not allow parameterized queries for `>` or `<` comparison operators. In these cases, do not use a user supplied `>` or `<` value, but rather have the user supply a `gt` or `lt` value. The alphabetical values are then used to look up the `>` and `<` values to be used in the construction of the dynamic query. The same goes for other queries where column or table names are required but cannot be parameterized. Data that is possible user-controlled from a python request is passed to `raw()` function. To remediate this issue, use django's QuerySets, which are built with query parameterization and therefore not vulnerable to sql injection. For example, you could use `Entry.objects.filter(date=2006)` If for some reason this is not feasible, ensure calls including user-supplied data pass it in to the `params` parameter of the `raw()` method. Below is an example using `raw()`, passing in user-supplied data as `params`. This will treat the query as a parameterized query and `params` as strictly data, preventing any possibility of SQL Injection. ``` def test(request): uname = request.GET["username"] res = User.objects.raw('SELECT * FROM myapp_user WHERE username = %s', (uname,)) ``` For more information on QuerySet see: - https://docs.djangoproject.com/en/5.0/ref/models/querysets/ For more information on SQL Injection see OWASP: - https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html

**Why.** Reported as CWE-89. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.bandit.B611-1` (generated/oss/audit.yaml).

## Examples

Bad:

```python
// untrusted input (source)
$PARAM
// flows to sink without sanitization
$QUERY
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B611-1` (metavariables start with `$`):

- `$PARAM`
- `def $VIEW(...,$PARAM,...):
  ...
  return ...`
- `$QUERY`
- `$MODEL.objects.raw($QUERY, ... )`
