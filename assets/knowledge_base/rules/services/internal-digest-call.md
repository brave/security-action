---
name: services/internal-digest-call
rubric: safety
severity: should_fix
languages: [python]
---

**Rule.** Internal Digest Direct Call, never call this directly

**Why.** Ported from opengrep rule `internal-digest-call` (services/internal-digest-call.yaml).

## Examples

Bad:

```python
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `internal-digest-call` (metavariables start with `$`):

- `_INTERNAL_DIGEST_NEVER_CALL_DIRECTLY`
