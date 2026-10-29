---
name: services/docker-compose-no-new-privileges
rubric: safety
severity: should_fix
languages: [yaml]
---

**Rule.** Service '$SERVICE' allows for privilege escalation via setuid or setgid binaries. Add 'no-new-privileges=true' in 'security_opt' to prevent this.

**Why.** Reported as CWE-732: Incorrect Permission Assignment for Critical Resource. See https://docs.docker.com/engine/reference/run/#security-configuration. See https://raesene.github.io/blog/2019/06/01/docker-capabilities-and-no-new-privs/. See https://www.kernel.org/doc/Documentation/prctl/no_new_privs.txt. See https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html#rule-4-add-no-new-privileges-flag. Ported from opengrep rule `docker-compose-no-new-privileges` (services/docker-compose-no-new-privileges.yaml).

## Examples

Bad:

```text
$SERVICE:
  ...
  image: ...
```

Good:

```text
$SERVICE:
  ...
  image: ...
  ...
  security_opt:
    - ...
    - no-new-privileges=true
    - ...
$SERVICE:
  ...
  extends: ...
```

## Detection hints

Literal patterns from opengrep rule `docker-compose-no-new-privileges` (metavariables start with `$`):

- `version: ...
...
services:
  ...`
- `$SERVICE:
  ...
  image: ...`
- `$SERVICE:
  ...
  image: ...
  ...
  security_opt:
    - ...
    - no-new-privileges=true
    - ...`
- `$SERVICE:
  ...
  extends: ...`
