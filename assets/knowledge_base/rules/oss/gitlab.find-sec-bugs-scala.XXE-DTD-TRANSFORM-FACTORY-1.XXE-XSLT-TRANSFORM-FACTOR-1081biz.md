---
name: oss/gitlab.find-sec-bugs-scala.XXE-DTD-TRANSFORM-FACTORY-1.XXE-XSLT-TRANSFORM-FACTOR-1081biz
rubric: safety
severity: should_fix
languages: [scala]
---

**Rule.** XML External Entity (XXE) attacks can occur when an XML parser supports XML entities while processing XML received from an untrusted source.

**Why.** Reported as CWE-611. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs_scala.XXE_DTD_TRANSFORM_FACTORY-1.XXE_XSLT_TRANSFORM_FACTORY-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// untrusted input (source)
$FACT.newTransformer
// flows to sink without sanitization
$T.transform(...)
```

Good:

```text
$T.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "");
$T.setAttribute(XMLConstants.ACCESS_EXTERNAL_SCHEMA, "");
$T.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.XXE_DTD_TRANSFORM_FACTORY-1.XXE_XSLT_TRANSFORM_FACTORY-1` (metavariables start with `$`):

- `$T.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "");`
- `$T.setAttribute(XMLConstants.ACCESS_EXTERNAL_SCHEMA, "");`
- `$T.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);`
- `$T.transform(...)`
- `import javax.xml.transform._
...`
- `import javax.xml.transform.Transformer
...`
- `$FACT.newTransformer`
