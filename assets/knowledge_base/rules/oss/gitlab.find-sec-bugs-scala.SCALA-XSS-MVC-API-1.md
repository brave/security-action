---
name: oss/gitlab.find-sec-bugs-scala.SCALA-XSS-MVC-API-1
rubric: safety
severity: should_fix
languages: [scala]
---

**Rule.** Disabling HTML escaping put the application at risk for Cross-Site Scripting (XSS).

**Why.** Reported as CWE-79. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs_scala.SCALA_XSS_MVC_API-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// flows to sink without sanitization
Ok(...)
```

Good:

```text
org.owasp.encoder.Encode.forHtml(...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.SCALA_XSS_MVC_API-1` (metavariables start with `$`):

- `org.owasp.encoder.Encode.forHtml(...)`
- `Ok(...)`
- `def $FUNC(..., $ARG: String, ...) = Action {
  ...
}`
