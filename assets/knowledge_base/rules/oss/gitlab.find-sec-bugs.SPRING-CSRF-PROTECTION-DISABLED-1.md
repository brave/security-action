---
name: oss/gitlab.find-sec-bugs.SPRING-CSRF-PROTECTION-DISABLED-1
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** The application fails to protect against Cross-Site Request Forgery (CSRF) due to disabling Spring's CSRF protection features. The vulnerability can be exploited by an adversary creating a link or form on a third party site and tricking an authenticated victim to access them. To remediate this issue, remove the call to `HttpSecurity.csrf().disable()` or remove the custom `CsrfConfigurer`. For more information on CSRF protection in Spring see: https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html#servlet-csrf Additionally, consider setting all session cookies to have the `SameSite=Strict` attribute. It should be noted that this may impact usability when sharing links across other mediums. It is recommended that a two cookie based approach is taken, as outlined in the [Top level navigations](https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-rfc6265bis-08#section-8.8.2) section of the SameSite RFC. For more information on CSRF see OWASP's guide: https://owasp.org/www-community/attacks/csrf

**Why.** Reported as CWE-352. Ported from opengrep rule `gitlab.find_sec_bugs.SPRING_CSRF_PROTECTION_DISABLED-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.SPRING_CSRF_PROTECTION_DISABLED-1` (metavariables start with `$`):

- `(org.springframework.security.config.annotation.web.builders.HttpSecurity $H). ... .csrf().disable();`
- `(org.springframework.security.config.annotation.web.configurers.CsrfConfigurer<HttpSecurity> $C).disable();`
