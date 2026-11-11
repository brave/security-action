---
name: oss/gitlab.find-sec-bugs.AWS-QUERY-INJECTION-1
rubric: safety
severity: should_fix
languages: [java]
cwe: [CWE-943]
---

**Rule.** Constructing SimpleDB queries containing user input can allow an attacker to view unauthorized records.

**Why.** Reported as CWE-943. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs.AWS_QUERY_INJECTION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// untrusted input (source)
$VAR
// flows to sink without sanitization
$QUERY
(AmazonSimpleDB $DB)
(AmazonSimpleDBClient $DB)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.AWS_QUERY_INJECTION-1` (metavariables start with `$`):

- `$REQ = new SelectRequest($QUERY, ...);
...
$DB.select($REQ);`
- `$DB.select(new SelectRequest($QUERY,...));`
- `$DB.select((SelectRequest $SR).withSelectExpression($QUERY,...));`
- `$QUERY`
- `(AmazonSimpleDB $DB)`
- `(AmazonSimpleDBClient $DB)`
- `$FUNC(..., $VAR, ...) {
  ...
}`
- `$VAR`
- `$FUNC(...) {
  ...
  $VAR = ... + $X;
  ...
}`
