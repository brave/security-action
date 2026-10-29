---
name: oss/gitlab.find-sec-bugs.INSECURE-COOKIE-1
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** The `Secure` attribute when set to `true` protects the cookie value from being being transmitted over clear text communication paths such as HTTP. By enabling this protection, the cookie will only be sent over HTTPS. Example of protecting a `Cookie`: ``` // Create an Secure cookie. Cookie someCookie = new Cookie("SomeCookieName", "SomeValue"); // Set Secure flag to true someCookie.setSecure(true); ``` For more information see: https://jakarta.ee/specifications/servlet/4.0/apidocs/javax/servlet/http/cookie#setSecure-boolean- Session cookies should be configured with the following security directives: - [HTTPOnly](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#restrict_access_to_cookies) - [SameSite](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite) - [Secure](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#restrict_access_to_cookies)

**Why.** Reported as CWE-614. Ported from opengrep rule `gitlab.find_sec_bugs.INSECURE_COOKIE-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
$X.servlet.http.Cookie $C = new $X.servlet.http.Cookie(..., ...);
...
($X.servlet.http.HttpServletResponse $RESP).addCookie($C);
```

Good:

```java
$X.servlet.http.Cookie $C = new $X.servlet.http.Cookie(..., ...);
...
$C.setSecure(true);
...
($X.servlet.http.HttpServletResponse $RESP).addCookie($C);
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.INSECURE_COOKIE-1` (metavariables start with `$`):

- `$X.servlet.http.Cookie $C = new $X.servlet.http.Cookie(..., ...);
...
($X.servlet.http.HttpServletResponse $RESP).addCookie($C);`
- `$X.servlet.http.Cookie $C = new $X.servlet.http.Cookie(..., ...);
...
$C.setSecure(true);
...
($X.servlet.http.HttpServletResponse $RESP).addCookie($C);`
