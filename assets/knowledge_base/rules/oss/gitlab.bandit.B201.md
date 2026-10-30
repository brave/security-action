---
name: oss/gitlab.bandit.B201
rubric: safety
severity: should_fix
languages: [python]
cwe: [CWE-489]
---

**Rule.** The Flask application is running with `debug=True` configured. By enabling this option, certain exceptions or errors could cause sensitive information to be leaked in HTTP responses. Additionally, it is not recommended to run a Flask application using `Flask.run(...)` in production. Instead, a WSGI server such as [gunicorn](https://flask.palletsprojects.com/en/2.3.x/deploying/gunicorn/) or [waitress](https://flask.palletsprojects.com/en/2.3.x/deploying/waitress/) be used instead. For more information on deployment options for Flask applications see: - https://flask.palletsprojects.com/en/2.3.x/deploying/

**Why.** Reported as CWE-489. Ported from opengrep rule `gitlab.bandit.B201` (generated/oss/audit.yaml).

## Examples

Bad:

```python
$APP.run(..., debug=True, ...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B201` (metavariables start with `$`):

- `import flask
...`
- `$APP.run(..., debug=True, ...)`
