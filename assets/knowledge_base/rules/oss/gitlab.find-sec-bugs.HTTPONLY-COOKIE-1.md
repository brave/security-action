---
name: oss/gitlab.find-sec-bugs.HTTPONLY-COOKIE-1
rubric: safety
severity: should_fix
languages: [java]
cwe: [CWE-1004]
---

**Rule.** The `HttpOnly` attribute when set to `true` protects the cookie value from being accessed by client side JavaScript such as reading the `document.cookie` values. By enabling this protection, a website that is vulnerable to Cross-Site Scripting (XSS) will be able to block malicious scripts from accessing the cookie value from JavaScript. Example of protecting a `Cookie`: ``` // Create an HttpOnly cookie. Cookie someCookie = new Cookie("SomeCookieName", "SomeValue"); // Set HttpOnly flag to true someCookie.setHttpOnly(true); ``` For more information see: https://jakarta.ee/specifications/servlet/4.0/apidocs/javax/servlet/http/cookie#setHttpOnly-boolean- Session cookies should be configured with the following security directives: - [HTTPOnly](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#restrict_access_to_cookies) - [Secure](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#restrict_access_to_cookies) - [SameSite](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)

**Why.** Reported as CWE-1004. Ported from opengrep rule `gitlab.find_sec_bugs.HTTPONLY_COOKIE-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.HTTPONLY_COOKIE-1` (metavariables start with `$`):

- `javax.servlet.http.Cookie $C = new Cookie(..., ...);
...
(HttpServletResponse $RESP).addCookie($C);`
- `javax.servlet.http.Cookie $C = new Cookie(..., ...);
...
$C.setHttpOnly(true);
...
(HttpServletResponse $RESP).addCookie($C);`
- `(javax.servlet.http.Cookie $C).setHttpOnly(false);`
