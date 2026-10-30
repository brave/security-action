---
name: oss/mobsf.mobsfscan.xxe.xmlfactory-external-entities-enabled.xmlinputfactory-xxe-ena-5ynom9
rubric: correctness
severity: should_fix
languages: [java]
cwe: [cwe-611]
---

**Rule.** XML external entities are enabled for this XMLInputFactory. This is vulnerable to XML external entity attacks. Disable external entities by setting "javax.xml.stream.isSupportingExternalEntities" to false.

**Why.** Reported as cwe-611. Ported from opengrep rule `mobsf.mobsfscan.xxe.xmlfactory_external_entities_enabled.xmlinputfactory_xxe_enabled` (generated/oss/others.yaml).

## Examples

Bad:

```java
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.xxe.xmlfactory_external_entities_enabled.xmlinputfactory_xxe_enabled` (metavariables start with `$`):

- `$XMLFACTORY.setProperty("javax.xml.stream.isSupportingExternalEntities", true);`
