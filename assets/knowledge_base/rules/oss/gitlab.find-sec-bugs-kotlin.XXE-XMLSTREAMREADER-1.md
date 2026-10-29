---
name: oss/gitlab.find-sec-bugs-kotlin.XXE-XMLSTREAMREADER-1
rubric: safety
severity: should_fix
languages: [kotlin]
---

**Rule.** XML External Entity (XXE) attacks can occur when an XML parser supports XML entities while processing XML received from an untrusted source.

**Why.** Reported as CWE-611. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.XXE_XMLSTREAMREADER-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
$SF.createXMLStreamReader(...)
```

Good:

```text
$SF.setProperty(XMLInputFactory.SUPPORT_DTD, false);
...
$SF.setProperty(XMLInputFactory.IS_SUPPORTING_EXTERNAL_ENTITIES, false);
...
$SF.setProperty(XMLInputFactory.SUPPORT_DTD, Boolean.FALSE);
...
$SF.setProperty(XMLInputFactory.IS_SUPPORTING_EXTERNAL_ENTITIES, Boolean.FALSE);
...
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.XXE_XMLSTREAMREADER-1` (metavariables start with `$`):

- `$SF = XMLInputFactory.newFactory();
...`
- `$SF.setProperty(XMLInputFactory.SUPPORT_DTD, false);
...`
- `$SF.setProperty(XMLInputFactory.IS_SUPPORTING_EXTERNAL_ENTITIES, false);
...`
- `$SF.setProperty(XMLInputFactory.SUPPORT_DTD, Boolean.FALSE);
...`
- `$SF.setProperty(XMLInputFactory.IS_SUPPORTING_EXTERNAL_ENTITIES, Boolean.FALSE);
...`
- `$SF.createXMLStreamReader(...)`
