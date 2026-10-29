---
name: oss/gitlab.security-code-scan.SCS0009-1
rubric: safety
severity: should_fix
languages: [csharp]
---

**Rule.** The `HttpOnly` attribute when set to `true` protects the cookie value from being accessed by client side JavaScript such as reading the `document.cookie` values. By enabling this protection, a website that is vulnerable to Cross-Site Scripting (XSS) will be able to block malicious scripts from accessing the cookie value from JavaScript. Example of protecting an HttpCookie: ``` // Create an HttpOnly cookie. HttpCookie someCookie = new HttpCookie("SomeCookieName", "SomeValue"); someCookie.HttpOnly = true; ``` For more information see: https://learn.microsoft.com/en-us/dotnet/api/system.web.httpcookie.httponly Session cookies should be configured with the following security directives: - [HTTPOnly](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#restrict_access_to_cookies) - [Secure](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#restrict_access_to_cookies) - [SameSite](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)

**Why.** Reported as CWE-1004. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.security_code_scan.SCS0009-1` (generated/oss/audit.yaml).

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
$COOKIE.HttpOnly = true;
```

## Detection hints

Literal patterns from opengrep rule `gitlab.security_code_scan.SCS0009-1` (metavariables start with `$`):

- `var $COOKIE = new HttpCookie(...);`
- `$COOKIE`
- `$COOKIE.HttpOnly = true;`
