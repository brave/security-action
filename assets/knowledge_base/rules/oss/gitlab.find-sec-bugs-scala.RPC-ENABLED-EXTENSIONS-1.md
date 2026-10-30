---
name: oss/gitlab.find-sec-bugs-scala.RPC-ENABLED-EXTENSIONS-1
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-502]
---

**Rule.** Enabling extensions in Apache XML RPC server or client can lead to deserialization vulnerability which would allow an attacker to execute arbitrary code.

**Why.** Reported as CWE-502. Ported from opengrep rule `gitlab.find_sec_bugs_scala.RPC_ENABLED_EXTENSIONS-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
$VAR.setEnabledForExtensions(true);
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.RPC_ENABLED_EXTENSIONS-1` (metavariables start with `$`):

- `val $VAR = new XmlRpcServerConfigImpl();
...`
- `$VAR.setEnabledForExtensions(true);`
- `val $VAR = new org.apache.xmlrpc.client.XmlRpcClientConfigImpl();
...`
