---
name: oss/gitlab.bandit.B611-2
rubric: safety
severity: should_fix
languages: [python]
---

**Rule.** SQL Injections are a critical type of vulnerability that can lead to data or system compromise. By dynamically generating SQL query strings, user input may be able to influence the logic of the SQL statement. This could lead to an adversary accessing information they should not have access to, or in some circumstances, being able to execute OS functionality or code. Replace all dynamically generated SQL queries with parameterized queries. In situations where dynamic queries must be created, never use direct user input, but instead use a map or dictionary of valid values and resolve them using a user supplied key. For example, some database drivers do not allow parameterized queries for `>` or `<` comparison operators. In these cases, do not use a user supplied `>` or `<` value, but rather have the user supply a `gt` or `lt` value. The alphabetical values are then used to look up the `>` and `<` values to be used in the construction of the dynamic query. The same goes for other queries where column or table names are required but cannot be parameterized. To remediate this issue, do not use `raw` or `RawSQL` but use other `QuerySet` methods to achieve the same goals. If for some reason this is not feasible, ensure calls including user-supplied data pass it in to the `params` parameter of the `RawSQL` method. While not recommended due to [potential SQL Injection](https://docs.djangoproject.com/en/5.0/ref/models/expressions/#raw-sql-expressions), below is an example using `RawSQL`. Passing in user-supplied data as a `param` which will escape the input: ``` # If dealing with integer based user input, restrict the values to integers only using the # path configuration: path('/someview/<int:user_supplied_id>', views.some_view, name='someview'), # views.py def some_view(request, user_supplied_id): # Never use string interpolation in the `sql` parameter. # Never quote the `%s` string format such as `... where id='%s'` as this could lead to SQL Injection. # Pass the user supplied data only in the `params` parameter. for obj in DBObject.objects.all().annotate( val=RawSQL(sql="select id from some_secondary_table where id=%s", params=[user_supplied_id])): # Work with the results from the query # ... ``` For more information on QuerySets see: - https://docs.djangoproject.com/en/4.2/ref/models/querysets/#queryset-api For more information on SQL Injection see OWASP: - https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html

**Why.** Reported as CWE-89. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.bandit.B611-2` (generated/oss/audit.yaml).

## Examples

Bad:

```python
// untrusted input (source)
$PARAM
// flows to sink without sanitization
$QUERY
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B611-2` (metavariables start with `$`):

- `$PARAM`
- `def $VIEW(...,$PARAM,...):
  ...
  return ...`
- `$QUERY`
- `django.db.models.expressions.RawSQL($QUERY, ... )`
