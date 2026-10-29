---
name: oss/gitlab.find-sec-bugs-scala.XXE-XMLREADER-1
rubric: safety
severity: should_fix
languages: [scala]
---

**Rule.** XML External Entity (XXE) attacks can occur when an XML parser supports XML entities while processing XML received from an untrusted source.

**Why.** Reported as CWE-611. Ported from opengrep rule `gitlab.find_sec_bugs_scala.XXE_XMLREADER-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
$R.parse(...)
```

Good:

```text
$R.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true)
...
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.XXE_XMLREADER-1` (metavariables start with `$`):

- `val $R = XMLReaderFactory.createXMLReader
...`
- `$R.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true)
...`
- `$R.parse(...)`
