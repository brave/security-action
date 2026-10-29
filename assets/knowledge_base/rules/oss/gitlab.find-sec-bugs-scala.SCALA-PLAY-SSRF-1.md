---
name: oss/gitlab.find-sec-bugs-scala.SCALA-PLAY-SSRF-1
rubric: safety
severity: should_fix
languages: [scala]
---

**Rule.** Server-Side Request Forgery occur when a web server executes a request to a user supplied destination parameter that is not validated. Such vulnerabilities could allow an attacker to access internal services or to launch attacks from your web server.

**Why.** Reported as CWE-918. Ported from opengrep rule `gitlab.find_sec_bugs_scala.SCALA_PLAY_SSRF-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
($W:WSClient).url(<...$ARG...>)
($W:play.api.libs.ws.WSClient).url(<...$ARG...>)
```

Good:

```text
object $CLAZZ {
  ...
  $ARG = ...
  ...
}
class $CLAZZ {
  ...
  $ARG = ...
  ...
}
($W:WSClient).url("...")
($W:WSClient).url("..." + "...")
($W:play.api.libs.ws.WSClient).url("...")
($W:play.api.libs.ws.WSClient).url("..." + "...")
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.SCALA_PLAY_SSRF-1` (metavariables start with `$`):

- `object $CLAZZ {
  ...
  $ARG = ...
  ...
}`
- `class $CLAZZ {
  ...
  $ARG = ...
  ...
}`
- `import play.api.libs.ws._
...`
- `($W:WSClient).url("...")`
- `($W:WSClient).url("..." + "...")`
- `($W:WSClient).url(<...$ARG...>)`
- `($W:play.api.libs.ws.WSClient).url(<...$ARG...>)`
- `($W:play.api.libs.ws.WSClient).url("...")`
- `($W:play.api.libs.ws.WSClient).url("..." + "...")`
