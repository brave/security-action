---
name: oss/gitlab.bandit.B113
rubric: safety
severity: should_fix
languages: [python]
cwe: [CWE-400]
---

**Rule.** The application was found using the `requests` module without configuring a timeout value for connections. This could lead to uncontrolled resource consumption where the application could run out of socket descriptors, effectively causing a Denial of Service (DoS). To remediate this issue, pass in a `timeout=` argument to each `requests` call. Example using a timeout for an HTTP GET request: ``` # Issue a GET request to https://example.com with a timeout of 10 seconds response = requests.get('https://example.com', timeout=10) # Work with the response object # ... ``` For more information on using the requests module see: - https://requests.readthedocs.io/en/latest/api/

**Why.** Reported as CWE-400. Ported from opengrep rule `gitlab.bandit.B113` (generated/oss/audit.yaml).

## Examples

Bad:

```python
requests.$METHOD(..., timeout=$VAL, ...)
requests.$METHOD(..., ...)
requests.$METHOD(...)
```

Good:

```python
requests.$METHOD(..., timeout=$VAL, ...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B113` (metavariables start with `$`):

- `requests.$METHOD(..., timeout=$VAL, ...)`
- `(^None)`
- `requests.$METHOD(..., ...)`
- `requests.$METHOD(...)`
- `(get|put|delete|post|options|head|patch)`
