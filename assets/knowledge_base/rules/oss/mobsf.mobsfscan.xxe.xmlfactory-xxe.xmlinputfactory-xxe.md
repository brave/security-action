---
name: oss/mobsf.mobsfscan.xxe.xmlfactory-xxe.xmlinputfactory-xxe
rubric: correctness
severity: should_fix
languages: [java]
cwe: [cwe-611]
---

**Rule.** XML external entities are not explicitly disabled for this XMLInputFactory. This could be vulnerable to XML external entity vulnerabilities. Explicitly disable external entities by setting "javax.xml.stream.isSupportingExternalEntities" to false.

**Why.** Reported as cwe-611. Ported from opengrep rule `mobsf.mobsfscan.xxe.xmlfactory_xxe.xmlinputfactory_xxe` (generated/oss/others.yaml).

## Examples

Bad:

```java
$XMLFACTORY = $W.newFactory(...);
$XMLFACTORY = new XMLInputFactory(...);
```

Good:

```java
$RETURNTYPE $METHOD(...) {
  ...
  $XMLFACTORY.setProperty("javax.xml.stream.isSupportingExternalEntities", false);
  ...
}
$RETURNTYPE $METHOD(...) {
  ...
  $XMLFACTORY.setProperty(java.xml.stream.XMLFactoryInput.IS_SUPPORTING_EXTERNAL_ENTITIES, false);
  ...
}
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.xxe.xmlfactory_xxe.xmlinputfactory_xxe` (metavariables start with `$`):

- `$RETURNTYPE $METHOD(...) {
  ...
  $XMLFACTORY.setProperty("javax.xml.stream.isSupportingExternalEntities", false);
  ...
}`
- `$RETURNTYPE $METHOD(...) {
  ...
  $XMLFACTORY.setProperty(java.xml.stream.XMLFactoryInput.IS_SUPPORTING_EXTERNAL_ENTITIES, false);
  ...
}`
- `$XMLFACTORY = $W.newFactory(...);`
- `$XMLFACTORY = new XMLInputFactory(...);`
