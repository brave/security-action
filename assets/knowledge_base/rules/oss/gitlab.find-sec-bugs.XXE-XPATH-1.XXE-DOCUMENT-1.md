---
name: oss/gitlab.find-sec-bugs.XXE-XPATH-1.XXE-DOCUMENT-1
rubric: safety
severity: should_fix
languages: [java]
cwe: [CWE-611]
---

**Rule.** XML External Entity (XXE) attacks can occur when an XML parser supports XML entities while processing XML received from an untrusted source.

**Why.** Reported as CWE-611. Ported from opengrep rule `gitlab.find_sec_bugs.XXE_XPATH-1.XXE_DOCUMENT-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
$SF.newDocumentBuilder(...)
```

Good:

```java
$DF.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "");
...
$DF.setAttribute(XMLConstants.ACCESS_EXTERNAL_SCHEMA, "");
...
$DF.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
...
$DF.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
...
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.XXE_XPATH-1.XXE_DOCUMENT-1` (metavariables start with `$`):

- `$DF = df.newDocumentBuilder();
...`
- `$DF.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "");
...`
- `$DF.setAttribute(XMLConstants.ACCESS_EXTERNAL_SCHEMA, "");
...`
- `$DF.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
...`
- `$DF.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
...`
- `$SF.newDocumentBuilder(...)`
