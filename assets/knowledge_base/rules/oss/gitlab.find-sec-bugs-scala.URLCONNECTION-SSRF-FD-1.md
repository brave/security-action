---
name: oss/gitlab.find-sec-bugs-scala.URLCONNECTION-SSRF-FD-1
rubric: safety
severity: should_fix
languages: [scala]
---

**Rule.** Server-Side Request Forgery occur when a web server executes a request to a user supplied destination parameter that is not validated. Such vulnerabilities could allow an attacker to access internal services or to launch attacks from your web server.

**Why.** Reported as CWE-918. Ported from opengrep rule `gitlab.find_sec_bugs_scala.URLCONNECTION_SSRF_FD-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.URLCONNECTION_SSRF_FD-1` (metavariables start with `$`):

- `import java.net._
...`
- `import java.net.URL
...`
- `import java.net.URI
...`
- `new $TYPE(...). ... .$FUNC`
- `new $TYPE("..."). ... .$FUNC`
- `connect`
- `GetContent`
- `openConnection`
- `openStream`
- `getContent`
- `URL`
- `java.net.URL`
- `URI`
- `java.net.URI`
- `import java.net.*;
...`
- `import java.net.InetSocketAddress;
...`
- `new InetSocketAddress(..., $PORT)`
- `new InetSocketAddress("...", $PORT)`
