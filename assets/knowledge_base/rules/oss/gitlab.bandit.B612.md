---
name: oss/gitlab.bandit.B612
rubric: safety
severity: should_fix
languages: [python]
---

**Rule.** The application was found calling the `logging.config.listen`` function, which provides the ability to listen for external configuration files over a socket server. This listen socket parses part of the configuration and calls `eval` on the supplied configuration file. A local user, or an adversary who is able to exploit a Server Side Request Forgery (SSRF) attack to communicate over localhost, would be able to execute arbitrary code by passing in a logging config that contains python code. To remediate the issue, remove the call to `logging.config.listen` method. For more information on the listen functionality see: - https://docs.python.org/3/library/logging.config.html#logging.config.listen

**Why.** Reported as CWE-94. Ported from opengrep rule `gitlab.bandit.B612` (generated/oss/audit.yaml).

## Examples

Bad:

```python
logging.config.listen(...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B612` (metavariables start with `$`):

- `logging.config.listen(...)`
