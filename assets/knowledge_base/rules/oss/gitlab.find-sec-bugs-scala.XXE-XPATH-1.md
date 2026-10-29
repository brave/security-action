---
name: oss/gitlab.find-sec-bugs-scala.XXE-XPATH-1
rubric: safety
severity: should_fix
languages: [scala]
---

**Rule.** XML External Entity (XXE) attacks can occur when an XML parser supports XML entities while processing XML received from an untrusted source.

**Why.** Reported as CWE-611. Ported from opengrep rule `gitlab.find_sec_bugs_scala.XXE_XPATH-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
$XPATH.evaluate(...)
```

Good:

```text
$DF.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "")
...
$DF.setAttribute(XMLConstants.ACCESS_EXTERNAL_SCHEMA, "")
...
$DF.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true)
...
$DF.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true)
...
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.XXE_XPATH-1` (metavariables start with `$`):

- `val $DF = DocumentBuilderFactory.newInstance
...`
- `$DF.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "")
...`
- `$DF.setAttribute(XMLConstants.ACCESS_EXTERNAL_SCHEMA, "")
...`
- `$DF.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true)
...`
- `$DF.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true)
...`
- `$B = $DF.newDocumentBuilder
...`
- `$XPATH.evaluate(...)`
