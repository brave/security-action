---
name: oss/gitlab.bandit.B610
rubric: safety
severity: should_fix
languages: [python]
---

**Rule.** SQL Injection is a critical vulnerability that can lead to data or system compromise. By dynamically generating SQL query strings, user input may be able to influence the logic of the SQL statement. This could lead to an adversary accessing information they should not have access to, or in some circumstances, being able to execute OS functionality or code. Replace all dynamically generated SQL queries with parameterized queries. In situations where dynamic queries must be created, never use direct user input, but instead use a map or dictionary of valid values and resolve them using a user supplied key. For example, some database drivers do not allow parameterized queries for `>` or `<` comparison operators. In these cases, do not use a user supplied `>` or `<` value, but rather have the user supply a `gt` or `lt` value. The alphabetical values are then used to look up the `>` and `<` values to be used in the construction of the dynamic query. The same goes for other queries where column or table names are required but cannot be parameterized. The `QuerySet.extra` API method will be deprecated as it a source of SQL Injection vulnerabilities and other problems. This method is especially risky as callers will need to do their own escaping of any parameters that come from user-supplied information. To remediate this issue, do not use `extra` but use other `QuerySet` methods to achieve the same goals. If for some reason this is not feasible, consider using the `RawSQL` method and making sure that all arguments, including user-supplied ones, are only used in `params` While not recommended due to [potential SQL Injection](https://docs.djangoproject.com/en/4.2/ref/models/expressions/#raw-sql-expressions), below is an example using `RawSQL`, passing in user-supplied data as a `param` which will escape the input: ``` # If dealing with integer based user input, restrict the values to integers only using the # path configuration: path('<int:user_supplied_id>/someview/', views.some_view, name='someview'), # views.py def some_view(request, user_supplied_id): # Never use string interpolation in the `sql` parameter. # Never quote the `%s` string format such as `... where id='%s'` as this could lead to SQL Injection. # Pass the user supplied data only in the `params` parameter. for obj in DBObject.objects.all().annotate( val=RawSQL(sql="select id from some_secondary_table where id=%s", params=[user_supplied_id])): # Work with the results from the query # ... ``` For more information on QuerySet see: - https://docs.djangoproject.com/en/4.2/ref/models/querysets/#queryset-api For more information on SQL Injection see OWASP: - https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html

**Why.** Reported as CWE-89. Ported from opengrep rule `gitlab.bandit.B610` (generated/oss/audit.yaml).

## Examples

Bad:

```python
$X.objects. ... .extra(..., $K = $V, ...)
$V
```

Good:

```python
$V = ['...']
...
[..., '...', ...]
{..., '...': '...', ...}
"..."
[..., "..." % "...", ...]
{..., $L: "..." % "...", ...}
{..., $L: "...".format("..."), ...}
[..., "...".format("..."), ...]
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B610` (metavariables start with `$`):

- `$X.objects. ... .extra(..., $K = $V, ...)`
- `$V = ['...']
...`
- `$V`
- `[..., '...', ...]`
- `{..., '...': '...', ...}`
- `"..."`
- `[..., "..." % "...", ...]`
- `{..., $L: "..." % "...", ...}`
- `{..., $L: "...".format("..."), ...}`
- `[..., "...".format("..."), ...]`
