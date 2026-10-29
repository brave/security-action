---
name: oss/gitlab.security-code-scan.SCS0017-1
rubric: safety
severity: should_fix
languages: [csharp]
cwe: [CWE-554]
---

**Rule.** By using the `[ValidateInput(false)]` attribute in a controller class, the application will disable request validation for that method. This disables ASP.NET from examining requests for injection attacks such as Cross-Site-Scripting (XSS). If possible, re-enable validation by using `ValidateInput(true)`. In some cases this may not be possible, in which case ensure how the request data used is validated and this method does not output user input directly into the view. For more information on protecting ASP.NET Core applications from XSS see: https://learn.microsoft.com/en-us/aspnet/core/security/cross-site-scripting Example of enabling `ValidateInput` attribute: ``` class ControllerClass { [ValidateInput(true)] public void SomeActionMethod() { } } ``` For more information on ASP.NET request validation see OWASP: https://owasp.org/www-community/ASP-NET_Request_Validation

**Why.** Reported as CWE-554. Ported from opengrep rule `gitlab.security_code_scan.SCS0017-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
[ValidateInput(false)]
public $RET $FOO(...)
{
  ...
}
```

## Detection hints

Literal patterns from opengrep rule `gitlab.security_code_scan.SCS0017-1` (metavariables start with `$`):

- `[ValidateInput(false)]
public $RET $FOO(...)
{
  ...
}`
