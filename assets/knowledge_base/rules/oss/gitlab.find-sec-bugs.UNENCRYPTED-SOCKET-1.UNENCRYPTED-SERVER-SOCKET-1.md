---
name: oss/gitlab.find-sec-bugs.UNENCRYPTED-SOCKET-1.UNENCRYPTED-SERVER-SOCKET-1
rubric: safety
severity: should_fix
languages: [java]
cwe: [CWE-319]
---

**Rule.** Beyond using an SSL socket, you need to make sure your use of SSLSocketFactory does all the appropriate certificate validation checks to make sure you are not subject to man-in-the-middle attacks. Please read the OWASP Transport Layer Protection Cheat Sheet for details on how to do this correctly.

**Why.** Reported as CWE-319. Ported from opengrep rule `gitlab.find_sec_bugs.UNENCRYPTED_SOCKET-1.UNENCRYPTED_SERVER_SOCKET-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
new java.net.Socket(...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.UNENCRYPTED_SOCKET-1.UNENCRYPTED_SERVER_SOCKET-1` (metavariables start with `$`):

- `new java.net.Socket(...)`
