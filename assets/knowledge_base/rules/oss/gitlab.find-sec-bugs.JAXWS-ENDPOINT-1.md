---
name: oss/gitlab.find-sec-bugs.JAXWS-ENDPOINT-1
rubric: safety
severity: nit
languages: [java]
cwe: [CWE-20]
---

**Rule.** This method is part of a SOAP Web Service (JSR224). The security of this web service should be analyzed; Authentication, if enforced, should be tested. Access control, if enforced, should be tested. The inputs should be tracked for potential vulnerabilities. The communication should ideally be over SSL.

**Why.** Reported as CWE-20. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs.JAXWS_ENDPOINT-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// untrusted input (source)
$VAR
// flows to sink without sanitization
return ...;
```

Good:

```java
$STR
org.apache.commons.text.StringEscapeUtils.unescapeJava(...);
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.JAXWS_ENDPOINT-1` (metavariables start with `$`):

- `$STR.replaceAll("$REPLACE_CHAR", "$REPLACER");
...`
- `$STR`
- `.*^(CRLF).*`
- `(*CRLF)`
- `org.apache.commons.text.StringEscapeUtils.unescapeJava(...);`
- `return ...;`
- `@javax.jws.WebMethod(...)
$TYPE $FUNC(..., $VAR, ...) {
  ...
}`
- `$VAR`
