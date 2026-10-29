---
name: oss/gitlab.find-sec-bugs-scala.AWS-QUERY-INJECTION-1
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-943]
---

**Rule.** Constructing SimpleDB queries containing user input can allow an attacker to view unauthorized records.

**Why.** Reported as CWE-943. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs_scala.AWS_QUERY_INJECTION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// untrusted input (source)
$REQ
$QUERY
// flows to sink without sanitization
new com.amazonaws.services.simpledb.model.SelectRequest($QUERY, ...);
$QUERY
($DB: com.amazonaws.services.simpledb.AmazonSimpleDB)
($DB: com.amazonaws.services.simpledb.AmazonSimpleDBClient)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.AWS_QUERY_INJECTION-1` (metavariables start with `$`):

- `new com.amazonaws.services.simpledb.model.SelectRequest($QUERY, ...);`
- `$DB.select(($SR: com.amazonaws.services.simpledb.model.SelectRequest).withSelectExpression($QUERY,...));`
- `$QUERY`
- `($DB: com.amazonaws.services.simpledb.AmazonSimpleDB)`
- `($DB: com.amazonaws.services.simpledb.AmazonSimpleDBClient)`
- `def $FUNC(..., $REQ: HttpServletRequest, ...): $TYPE = {
  ...
}`
- `$REQ`
- `def $FUNC(..., $X: $TYPE, ...): $RET_TYPE = {
  ...
  $QUERY = <...$X...>
  ...
}`
