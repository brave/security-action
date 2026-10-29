---
name: oss/gitlab.find-sec-bugs-scala.MALICIOUS-XSLT-1
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** It is possible to attach malicious behavior to those style sheets. Therefore, if an attacker can control the content or the source of the style sheet, he might be able to trigger remote code execution.

**Why.** Reported as CWE-74. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs_scala.MALICIOUS_XSLT-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// untrusted input (source)
new FileInputStream(<... $VAR ...>);
getClass.getResourceAsStream(<... $VAR ...>)
new FileInputStream($X + $Y);
getClass.getResourceAsStream($X + $Y)
// flows to sink without sanitization
$SRC
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.MALICIOUS_XSLT-1` (metavariables start with `$`):

- `$FUNC(...,String $VAR, ...) {
  ...
}`
- `new FileInputStream(<... $VAR ...>);`
- `getClass.getResourceAsStream(<... $VAR ...>)`
- `class $CLZ {
  String $X = "...";
  ...
}`
- `$FUNC(...,String $Y, ...) {
  ...
}`
- `new FileInputStream($X + $Y);`
- `getClass.getResourceAsStream($X + $Y)`
- `(javax.xml.transform.TransformerFactory $T).newTransformer($SRC, ...)`
- `(javax.xml.transform.Transformer $T).transform($SRC, ...)`
- `$SRC`
