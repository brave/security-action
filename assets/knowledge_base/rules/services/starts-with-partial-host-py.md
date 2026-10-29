---
name: services/starts-with-partial-host-py
rubric: safety
severity: should_fix
languages: [python]
---

**Rule.** Add a forward-slash at the end to prevent matching `$PREFIX.e.vil` or `$PREFIX@e.vil`. Even better, properly parse the URL and match a list of origins/hosts.

**Why.** Reported as CWE-346: Origin Validation Error. Ported from opengrep rule `starts-with-partial-host-py` (services/starts-with-partial-host-py.yaml).

## Examples

Bad:

```python
$URL.startswith("$PREFIX")
```

## Detection hints

Literal patterns from opengrep rule `starts-with-partial-host-py` (metavariables start with `$`):

- `$URL.startswith("$PREFIX")`
- `(?i)^https?://[^/]+$`
- `(?i).*ur[li].*`
