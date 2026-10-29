---
name: oss/gitlab.find-sec-bugs.XXE-DTD-TRANSFORM-FACTORY-1.XXE-XSLT-TRANSFORM-FACTORY-1
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** XML External Entity (XXE) attacks can occur when an XML parser supports XML entities while processing XML received from an untrusted source.

**Why.** Reported as CWE-611. Ported from opengrep rule `gitlab.find_sec_bugs.XXE_DTD_TRANSFORM_FACTORY-1.XXE_XSLT_TRANSFORM_FACTORY-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
$T.transform(...)
```

Good:

```java
$T.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "");
...
$T.setAttribute(XMLConstants.ACCESS_EXTERNAL_SCHEMA, "");
...
$T.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
...
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.XXE_DTD_TRANSFORM_FACTORY-1.XXE_XSLT_TRANSFORM_FACTORY-1` (metavariables start with `$`):

- `import javax.xml.transform.*; ...`
- `$T = $FACT.newTransformer();
...`
- `$T.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "");
...`
- `$T.setAttribute(XMLConstants.ACCESS_EXTERNAL_SCHEMA, "");
...`
- `$T.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
...`
- `$T.transform(...)`
