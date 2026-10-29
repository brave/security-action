---
name: oss/gitlab.security-code-scan.SCS0008-1
rubric: safety
severity: should_fix
languages: [csharp]
---

**Rule.** The `Secure` attribute when set to `true` protects the cookie value from being being transmitted over clear text communication paths such as HTTP. By enabling this protection, the cookie will only be sent over HTTPS. Example of protecting an HttpCookie: ``` // Create an HttpOnly cookie. HttpCookie someCookie = new HttpCookie("SomeCookieName", "SomeValue"); someCookie.Secure = true; ``` For more information see: https://learn.microsoft.com/en-us/dotnet/api/system.web.httpcookie.secure Session cookies should be configured with the following security directives: - [HTTPOnly](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#restrict_access_to_cookies) - [SameSite](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite) - [Secure](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#restrict_access_to_cookies)

**Why.** Reported as CWE-614. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.security_code_scan.SCS0008-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// untrusted input (source)
var $COOKIE = new HttpCookie(...);
// flows to sink without sanitization
$COOKIE
```

Good:

```text
$COOKIE.Secure = true;
```

## Detection hints

Literal patterns from opengrep rule `gitlab.security_code_scan.SCS0008-1` (metavariables start with `$`):

- `var $COOKIE = new HttpCookie(...);`
- `$COOKIE`
- `$COOKIE.Secure = true;`
