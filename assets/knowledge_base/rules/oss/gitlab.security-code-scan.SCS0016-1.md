---
name: oss/gitlab.security-code-scan.SCS0016-1
rubric: safety
severity: should_fix
languages: [csharp]
cwe: [CWE-352]
---

**Rule.** The application failed to protect against Cross-Site Request Forgery (CSRF) due to not including the `[ValidateAntiForgeryToken]` attribute on an HTTP method handler that could change user state (usually in the form of POST or PUT methods). The vulnerability can be exploited by an adversary creating a link or form on a third party site and tricking an authenticated victim to access them. Add the `[ValidateAntiForgeryToken]` to all methods which take in user data and change user state (such as updating a database with a new value). This is especially true for functionality such as updating passwords or other security sensitive functions. Alternatively, applications can enable a global [AutoValidateAntiforgeryTokenAttribute](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.autovalidateantiforgerytokenattribute) filter. For more information on ValidateAntiForgeryToken and other CSRF protections in .NET see the following URL: https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery Additionally, consider setting all session cookies to have the `SameSite=Strict` attribute. It should be noted that this may impact usability when sharing links across other mediums. It is recommended that a two cookie based approach is taken, as outlined in the [Top level navigations](https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-rfc6265bis-08#section-8.8.2) section of the SameSite RFC. For more information on CSRF see OWASP's guide: https://owasp.org/www-community/attacks/csrf

**Why.** Reported as CWE-352. Ported from opengrep rule `gitlab.security_code_scan.SCS0016-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
[$HTTPMETHOD]
public $RET $FOO(...) {
  ...
}
```

Good:

```text
[ValidateAntiForgeryToken]
public $RET $FOO(...) {
  ...
}
```

## Detection hints

Literal patterns from opengrep rule `gitlab.security_code_scan.SCS0016-1` (metavariables start with `$`):

- `[$HTTPMETHOD]
public $RET $FOO(...) {
  ...
}`
- `[ValidateAntiForgeryToken]
public $RET $FOO(...) {
  ...
}`
- `Http(Post|Delete|Patch|Put)`
