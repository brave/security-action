---
name: oss/gitlab.bandit.B501
rubric: safety
severity: should_fix
languages: [python]
cwe: [CWE-295]
---

**Rule.** The application was found using the `requests` module without configuring a timeout value for connections. The `verify=False` argument has been set, which effectively disables the validation of server certificates. This allows for an adversary who is in between the application and the target host to intercept potentially sensitive information or transmit malicious data. To remediate this issue either remove the `verify=False` argument, or set `verify=True`to each `requests` call. Example verifying server certificates for an HTTP GET request: ``` # Issue a GET request to https://example.com with a timeout of 10 seconds and verify the # server certificate explicitly. response = requests.get('https://example.com', timeout=10, verify=True) # Work with the response object # ... ``` For more information on using the requests module see: - https://requests.readthedocs.io/en/latest/api/

**Why.** Reported as CWE-295. Ported from opengrep rule `gitlab.bandit.B501` (generated/oss/audit.yaml).

## Examples

Bad:

```python
requests.put(..., verify=False, ...)
requests.patch(..., verify=False, ...)
requests.delete(..., verify=False, ...)
requests.head(..., verify=False, ...)
requests.options(..., verify=False, ...)
requests.request(..., verify=False, ...)
requests.get(..., verify=False, ...)
requests.post(..., verify=False, ...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B501` (metavariables start with `$`):

- `requests.put(..., verify=False, ...)`
- `requests.patch(..., verify=False, ...)`
- `requests.delete(..., verify=False, ...)`
- `requests.head(..., verify=False, ...)`
- `requests.options(..., verify=False, ...)`
- `requests.request(..., verify=False, ...)`
- `requests.get(..., verify=False, ...)`
- `requests.post(..., verify=False, ...)`
