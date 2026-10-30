---
name: oss/raptor-argv-envp-access
rubric: safety
severity: nit
languages: [c, cpp]
---

**Rule.** The program accesses command-line arguments or environment variables, which are controlled by potential attackers.

**Why.** See https://www.gnu.org/software/libc/manual/html_node/Program-Arguments.html. Ported from opengrep rule `raptor-argv-envp-access` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
argv
envp
```

## Detection hints

Literal patterns from opengrep rule `raptor-argv-envp-access` (metavariables start with `$`):

- `argv`
- `envp`
