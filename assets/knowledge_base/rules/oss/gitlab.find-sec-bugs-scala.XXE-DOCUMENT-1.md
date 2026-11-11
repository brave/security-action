---
name: oss/gitlab.find-sec-bugs-scala.XXE-DOCUMENT-1
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-611]
---

**Rule.** XML External Entity (XXE) attacks can occur when an XML parser supports XML entities while processing XML received from an untrusted source.

**Why.** Reported as CWE-611. Ported from opengrep rule `gitlab.find_sec_bugs_scala.XXE_DOCUMENT-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
$DB.parse(...)
```

Good:

```text
$DF.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true)
...
$DF.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true)
...
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.XXE_DOCUMENT-1` (metavariables start with `$`):

- `$DF = DocumentBuilderFactory.newInstance
...`
- `$DF.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true)
...`
- `$DF.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true)
...`
- `$DB.parse(...)`
