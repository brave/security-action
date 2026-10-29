---
name: oss/gitlab.find-sec-bugs-scala.JAXRS-ENDPOINT-1
rubric: safety
severity: nit
languages: [scala]
---

**Rule.** This method is part of a REST Web Service (JSR311). The security of this web service should be analyzed. For example: - Authentication, if enforced, should be tested. - Access control, if enforced, should be tested. - The inputs should be tracked for potential vulnerabilities. - The communication should ideally be over SSL. - If the service supports writes (e.g., via POST), its vulnerability to CSRF should be investigated.

**Why.** Reported as CWE-20. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs_scala.JAXRS_ENDPOINT-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// untrusted input (source)
$VAR
// flows to sink without sanitization
<...$VAR...>
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.JAXRS_ENDPOINT-1` (metavariables start with `$`):

- `<...$VAR...>`
- `@javax.ws.rs.Path("...")
def $FUNC(..., $VAR: $TYPE, ...) = ...`
- `$VAR`
