---
name: oss/trailofbits.hcl.nomad.root-user.root-user
rubric: safety
severity: should_fix
languages: [hcl]
cwe: [CWE-250]
---

**Rule.** Found Nomad task using root user

**Why.** Reported as CWE-250: Execution with Unnecessary Privileges. See https://developer.hashicorp.com/nomad/docs/job-specification/task#user. See https://developer.hashicorp.com/nomad/docs/configuration/client#user-denylist. Ported from opengrep rule `trailofbits.hcl.nomad.root-user.root-user` (generated/oss/audit.yaml).

## Examples

Bad:

```text
user = "root"
user = "Administrator"
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.hcl.nomad.root-user.root-user` (metavariables start with `$`):

- `task "..." { ... }`
- `user = "root"`
- `user = "Administrator"`
