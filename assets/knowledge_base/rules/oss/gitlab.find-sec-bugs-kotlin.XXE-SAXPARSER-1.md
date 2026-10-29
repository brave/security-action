---
name: oss/gitlab.find-sec-bugs-kotlin.XXE-SAXPARSER-1
rubric: safety
severity: should_fix
languages: [kotlin]
---

**Rule.** XML External Entity (XXE) attacks can occur when an XML parser supports XML entities while processing XML received from an untrusted source.

**Why.** Reported as CWE-611. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.XXE_SAXPARSER-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
$P.parse(...);
```

Good:

```text
$SF.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
...
$SF.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
...
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.XXE_SAXPARSER-1` (metavariables start with `$`):

- `$SF = SAXParserFactory.newInstance()
...`
- `$SF.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
...`
- `$SF.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
...`
- `$P = $SFP.newSAXParser();
...`
- `$P.parse(...);`
