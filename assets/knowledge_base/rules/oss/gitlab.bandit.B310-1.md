---
name: oss/gitlab.bandit.B310-1
rubric: safety
severity: should_fix
languages: [python]
---

**Rule.** The application was found passing in a non-literal value to the `urllib` methods which issue requests. `urllib` supports the `file://` scheme, which may allow an adversary who can control the URL value to read arbitrary files on the file system. To remediate this issue either hardcode the URLs being used in urllib or use the `requests` module instead. Example using the `requests` module to issue an HTTPS request: ``` import requests # Issue a GET request to https://example.com with a timeout of 10 seconds response = requests.get('https://example.com', timeout=10) # Work with the response object # ... ```

**Why.** Reported as CWE-939. Ported from opengrep rule `gitlab.bandit.B310-1` (generated/oss/audit.yaml).

## Examples

Bad:

```python
urllib.$METHOD(...)
urllib.request.$METHOD(...)
$OPENER.open(...)
$OPENER.retrieve(...)
```

Good:

```python
urllib.$METHOD("...")
urllib.request.$METHOD("...")
urllib.$METHOD("...", ...)
urllib.request.$METHOD("...", ...)
$OPENER.open("...")
$OPENER.retrieve("...")
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B310-1` (metavariables start with `$`):

- `urllib.$METHOD(...)`
- `urllib.request.$METHOD(...)`
- `urllib.$METHOD("...")`
- `urllib.request.$METHOD("...")`
- `urllib.$METHOD("...", ...)`
- `urllib.request.$METHOD("...", ...)`
- `(urlopen|urlretrieve)`
- `$OPENER = urllib.URLopener(...)
...`
- `$OPENER = urllib.request.URLopener(...)
...`
- `$OPENER = urllib.FancyURLopener(...)
...`
- `$OPENER = urllib.request.FancyURLopener(...)
...`
- `$OPENER.open(...)`
- `$OPENER.retrieve(...)`
- `$OPENER.open("...")`
- `$OPENER.retrieve("...")`
