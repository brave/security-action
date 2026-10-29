---
name: oss/gitlab.find-sec-bugs.RPC-ENABLED-EXTENSIONS-1
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** Enabling extensions in Apache XML RPC server or client can lead to deserialization vulnerability which would allow an attacker to execute arbitrary code.

**Why.** Reported as CWE-502. Ported from opengrep rule `gitlab.find_sec_bugs.RPC_ENABLED_EXTENSIONS-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
$VAR.setEnabledForExtensions(true);
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.RPC_ENABLED_EXTENSIONS-1` (metavariables start with `$`):

- `XmlRpcServerConfigImpl $VAR = new org.apache.xmlrpc.server.XmlRpcServerConfigImpl();
...`
- `$VAR.setEnabledForExtensions(true);`
- `XmlRpcClientConfigImpl $VAR = new org.apache.xmlrpc.client.XmlRpcClientConfigImpl();
...`
