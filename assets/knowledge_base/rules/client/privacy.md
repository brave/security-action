---
name: client/privacy
rubric: safety
severity: should_fix
languages: [generic]
---

**Rule.** Privacy claim found

**Why.** Ported from opengrep rule `privacy` (client/privacy.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `privacy` (metavariables start with `$`):

- `completely private`
- `military grade`
- `military-grade`
- `totally secure`
- `unbreakable encryption`
- `unhackable`
- `hackerproof`
- `hacker-proof`
