---
name: oss/gitlab.flawfinder.RpcImpersonateClient-1.ImpersonateLoggedOnUser-1.CoImpersonate-1skt89x
rubric: safety
severity: should_fix
languages: [c, cpp]
cwe: [CWE-250]
---

**Rule.** These functions may be used to either drop or change account privileges. If the calls fail, the process will continue to run with the privileges assigned to it on start. Depending on the logic of the application, this may allow attackers to abuse the system due to privileges never being changed to a different access level. Always ensure return values of this function are checked to determine if the application should continue to operate.

**Why.** Reported as CWE-250. Ported from opengrep rule `gitlab.flawfinder.RpcImpersonateClient-1.ImpersonateLoggedOnUser-1.CoImpersonateClient-1.ImpersonateNamedPipeClient-1.ImpersonateDdeClientWindow-1.ImpersonateSecurityContext-1.SetThreadToken-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.RpcImpersonateClient-1.ImpersonateLoggedOnUser-1.CoImpersonateClient-1.ImpersonateNamedPipeClient-1.ImpersonateDdeClientWindow-1.ImpersonateSecurityContext-1.SetThreadToken-1` (metavariables start with `$`):

- `RpcImpersonateClient(...)`
- `ImpersonateLoggedOnUser(...)`
- `CoImpersonateClient(...)`
- `ImpersonateNamedPipeClient(...)`
- `ImpersonateDdeClientWindow(...)`
- `ImpersonateSecurityContext(...)`
- `SetThreadToken(...)`
