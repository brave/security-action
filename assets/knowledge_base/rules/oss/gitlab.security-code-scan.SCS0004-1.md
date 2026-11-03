---
name: oss/gitlab.security-code-scan.SCS0004-1
rubric: safety
severity: should_fix
languages: [csharp]
cwe: [CWE-295]
---

**Rule.** The `ServicePointManager.ServerCertificateValidationCallback` event has been set to always return `true`, which effectively disables the validation of server certificates. This allows for an adversary who is in between the application and the target host to intercept potentially sensitive information or transmit malicious data. Remove the callback function that is returning true to allow normal certificate validation to proceed. When no callback is provided, the client will validate that the certificate name matches the hostname that was used when creating the request. For more information on the `ServerCertificateValidationCallback` property see: https://learn.microsoft.com/en-us/dotnet/api/system.net.servicepointmanager.servercertificatevalidationcallback

**Why.** Reported as CWE-295. Ported from opengrep rule `gitlab.security_code_scan.SCS0004-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
ServicePointManager.ServerCertificateValidationCallback += $CALLBACK;
$RETURNTYPE $FUNC(...) { return true; }
(...) => true;
```

## Detection hints

Literal patterns from opengrep rule `gitlab.security_code_scan.SCS0004-1` (metavariables start with `$`):

- `using System.Net;
...`
- `ServicePointManager.ServerCertificateValidationCallback += $CALLBACK;`
- `$RETURNTYPE $FUNC(...) { return true; }`
- `(...) => true;`
