---
name: oss/gitlab.find-sec-bugs-kotlin.MALICIOUS-XSLT-1
rubric: safety
severity: should_fix
languages: [kotlin]
---

**Rule.** It is possible to attach malicious behavior to those style sheets. Therefore, if an attacker can control the content or the source of the style sheet, he might be able to trigger remote code execution.

**Why.** Reported as CWE-74. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.MALICIOUS_XSLT-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// untrusted input (source)
FileInputStream(<... $VAR ...>);
javaClass.getResourceAsStream(<... $VAR ...>)
FileInputStream($X + $Y);
javaClass.getResourceAsStream($X + $Y)
// flows to sink without sanitization
$SRC
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.MALICIOUS_XSLT-1` (metavariables start with `$`):

- `fun $FUNC(...,$VAR: String, ...) {
  ...
}`
- `FileInputStream(<... $VAR ...>);`
- `javaClass.getResourceAsStream(<... $VAR ...>)`
- `class $CLZ {
  var $X = "...";
  ...
}`
- `fun $FUNC(...,$Y: String, ...) {
  ...
}`
- `FileInputStream($X + $Y);`
- `javaClass.getResourceAsStream($X + $Y)`
- `($T: javax.xml.transform.TransformerFactory).newTransformer($SRC, ...)`
- `($T: javax.xml.transform.Transformer).transform($SRC, ...)`
- `$FACTORY = javax.xml.transform.TransformerFactory.newInstance(...)
...`
- `$FACTORY.newTransformer($SRC, ...)`
- `$FACTORY = javax.xml.transform.TransformerFactory(...)
...`
- `$T = $FACTORY.newTransformer(...)
...`
- `$T.transform($SRC, ...)`
- `$SRC`
