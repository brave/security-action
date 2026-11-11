---
name: oss/gitlab.find-sec-bugs-kotlin.SPRING-CSRF-PROTECTION-DISABLED-1
rubric: safety
severity: should_fix
languages: [kotlin]
cwe: [CWE-352]
---

**Rule.** The application fails to protect against Cross-Site Request Forgery (CSRF) due to disabling Spring's CSRF protection features.

**Why.** Reported as CWE-352. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.SPRING_CSRF_PROTECTION_DISABLED-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.SPRING_CSRF_PROTECTION_DISABLED-1` (metavariables start with `$`):

- `($H: org.springframework.security.config.annotation.web.builders.HttpSecurity). ... .csrf().disable()`
- `($C: CsrfConfigurer<HttpSecurity>).disable()`
