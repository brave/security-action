---
name: oss/gitlab.flawfinder.SetSecurityDescriptorDacl-1
rubric: safety
severity: should_fix
languages: [c, cpp]
cwe: [CWE-732]
---

**Rule.** When `SetSecurityDescriptorDacl` is called with a null `pDacl` parameter and the `bDaclPresent` flag is `TRUE`, all access to the object is allowed. An attacker could set the object to Deny all, which would include even the Administrator user(s). Either call `SetSecurityDescriptorDacl` with bDaclPresent as `FALSE`, or supply a valid non-null `pDacl` parameter value. For more information please see: https://learn.microsoft.com/en-us/windows/win32/api/securitybaseapi/nf-securitybaseapi-setsecuritydescriptordacl#remarks

**Why.** Reported as CWE-732. Ported from opengrep rule `gitlab.flawfinder.SetSecurityDescriptorDacl-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.SetSecurityDescriptorDacl-1` (metavariables start with `$`):

- `SetSecurityDescriptorDacl(...)`
