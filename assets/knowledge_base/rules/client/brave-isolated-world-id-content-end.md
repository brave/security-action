---
name: client/brave-isolated-world-id-content-end
rubric: safety
severity: should_fix
languages: [generic]
---

**Rule.** Security hotspot found (`ISOLATED_WORLD`). A security-team member should analyze the code security for possible vulnerabilities.

**Why.** Reported as CWE-94: Improper Control of Generation of Code ('Code Injection'). Ported from opengrep rule `brave-isolated-world-id-content-end` (client/brave-isolated-world.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `brave-isolated-world-id-content-end` (metavariables start with `$`):

- `ISOLATED_WORLD_ID_CONTENT_END`
- `ISOLATED_WORLD_ID_BRAVE_INTERNAL`
