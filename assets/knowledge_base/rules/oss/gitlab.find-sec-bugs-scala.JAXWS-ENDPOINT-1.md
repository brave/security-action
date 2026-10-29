---
name: oss/gitlab.find-sec-bugs-scala.JAXWS-ENDPOINT-1
rubric: safety
severity: nit
languages: [scala]
---

**Rule.** This method is part of a SOAP Web Service (JSR224). The security of this web service should be analyzed. For example: - Authentication, if enforced, should be tested. - Access control, if enforced, should be tested. - The inputs should be tracked for potential vulnerabilities. - The communication should ideally be over SSL.

**Why.** Reported as CWE-20. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs_scala.JAXWS_ENDPOINT-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// untrusted input (source)
$VAR
// flows to sink without sanitization
<...$VAR...>
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.JAXWS_ENDPOINT-1` (metavariables start with `$`):

- `<...$VAR...>`
- `@javax.jws.WebMethod(...)
def $FUNC(..., $VAR: $TYPE, ...) = ...`
- `$VAR`
