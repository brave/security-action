---
name: oss/gitlab.find-sec-bugs-kotlin.XPATH-INJECTION-1
rubric: safety
severity: should_fix
languages: [kotlin]
---

**Rule.** The input values included in SQL queries need to be passed in safely. Bind variables in prepared statements can be used to easily mitigate the risk of SQL injection.

**Why.** Reported as CWE-643. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.XPATH_INJECTION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// untrusted input (source)
$VAR
// flows to sink without sanitization
$X.compile($VAR)
$X.evaluate($VAR, ...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.XPATH_INJECTION-1` (metavariables start with `$`):

- `fun $FUNC(..., $VAR: $T, ...) {
  ...
}`
- `$VAR`
- `import javax.xml.xpath.*; 
...`
- `import javax.xml.xpath.XPath; 
...`
- `$X.compile($VAR)`
- `$X.compile("...")`
- `$X.evaluate($VAR, ...)`
- `$X.evaluate("...", ...)`
- `$X.xPathVariableResolver = ...;
...;
$X.compile("...");`
- `$X.setXPathVariableResolver(...);
...;
$X.compile("...");`
