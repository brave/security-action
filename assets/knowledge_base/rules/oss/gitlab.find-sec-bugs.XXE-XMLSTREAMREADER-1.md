---
name: oss/gitlab.find-sec-bugs.XXE-XMLSTREAMREADER-1
rubric: safety
severity: should_fix
languages: [java]
cwe: [CWE-611]
---

**Rule.** External XML entities are a feature of XML parsers that allow documents to contain references to other documents or data. This feature can be abused to read files, communicate with external hosts, exfiltrate data, or cause a Denial of Service (DoS). In most XML parsers, the recommendation to protect against XXE is to disable the doctype feature. Unfortunately use of the `XMLInputFactory` requires that the doctypes feature be enabled. Instead the application can set the `ACCESS_EXTERNAL_DTD` to an empty string and disable `javax.xml.stream.isSupportingExternalEntities`. Creates an `XMLInputFactory` stream parser, but disables accessing external DTD or entities: ``` // Create an XMLInputFactory XMLInputFactory factory = XMLInputFactory.newFactory(); // Set the ACCESS_EXTERNAL_DTD property to an empty string so it won't access // entities using protocols // (ref: https://docs.oracle.com/javase/8/docs/api/javax/xml/XMLConstants.html#ACCESS_EXTERNAL_DTD) factory.setProperty(XMLConstants.ACCESS_EXTERNAL_DTD, ""); // Additionally, disable support for resolving external entities factory.setProperty("javax.xml.stream.isSupportingExternalEntities", false); // Continue to work with the factory/stream parser ``` For more information on XML security see OWASP's guide: https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html#java

**Why.** Reported as CWE-611. Ported from opengrep rule `gitlab.find_sec_bugs.XXE_XMLSTREAMREADER-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
$SF.createXMLStreamReader(...)
```

Good:

```java
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

Literal patterns from opengrep rule `gitlab.find_sec_bugs.XXE_XMLSTREAMREADER-1` (metavariables start with `$`):

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
