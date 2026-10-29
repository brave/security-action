---
name: oss/gitlab.bandit.B307
rubric: safety
severity: should_fix
languages: [python]
---

**Rule.** The application was found calling the `eval` function with non-literal data. If the variable contains user-controlled data, either partially or fully, an adversary could compromise the entire system by executing arbitrary Python code. To remediate this issue, remove all calls to `eval` and consider alternative methods for executing the necessary business logic. There is almost no safe method of calling `eval` with user-supplied input. If the application only needs to convert strings into objects, consider using `json.loads`. In some cases `ast.literal_eval` is recommended, but this should be avoided as it can still suffer from other issues such as the ability for malicious code to crash the python interpreter or application. Example using `json.loads`` to load in arbitrary data to create data structures: ``` # User supplied data as a blob of JSON user_supplied_data = """{"user": "test", "metadata": [1,2,3]}""" # Load the JSON user_object = json.loads(user_supplied_data) # Manually add protected properties _after_ loading, never before user_object["is_admin"] = False # Work with the object ```

**Why.** Reported as CWE-95. Ported from opengrep rule `gitlab.bandit.B307` (generated/oss/audit.yaml).

## Examples

Bad:

```python
eval($X,...)
```

Good:

```python
eval("...")
eval("..." % <... "..." ...>)
eval(<... "...".format( "..." ) ...>)
def eval(...):
  ...
...
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B307` (metavariables start with `$`):

- `eval($X,...)`
- `eval("...")`
- `eval("..." % <... "..." ...>)`
- `eval(<... "...".format( "..." ) ...>)`
- `def eval(...):
  ...
...`
