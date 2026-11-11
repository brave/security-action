---
name: oss/gitlab.find-sec-bugs-scala.XPATH-INJECTION-1
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-611]
---

**Rule.** The input values included in SQL queries need to be passed in safely. Bind variables in prepared statements can be used to easily mitigate the risk of SQL injection.

**Why.** Reported as CWE-611. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs_scala.XPATH_INJECTION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// untrusted input (source)
$ARG
// flows to sink without sanitization
$Y.compile(...)
$X.evaluate(..., $ARG2)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.XPATH_INJECTION-1` (metavariables start with `$`):

- `import javax.xml.xpath._
...`
- `import javax.xml.xpath.XPath
...`
- `$Y.compile(...)`
- `$X.evaluate(..., $ARG2)`
- `def $FUNC(..., $ARG: $TYPE,...): $RET = {
  ...
}`
- `$ARG`
