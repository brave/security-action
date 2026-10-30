---
name: oss/gitlab.find-sec-bugs.XXE-SAXPARSER-1
rubric: safety
severity: should_fix
languages: [java]
cwe: [CWE-611]
---

**Rule.** External XML entities are a feature of XML parsers that allow documents to contain references to other documents or data. This feature can be abused to read files, communicate with external hosts, exfiltrate data, or cause a Denial of Service (DoS). It is recommended that the `SAXParser` is configured to disable DTD doctypes as this protects against the majority of XXE attacks. Example creating a SAXParser with disallowing the doctypes feature enabled: ``` // Create a SAXParserFactory SAXParserFactory saxParserFactory = SAXParserFactory.newInstance(); // Enable the feature which disallows <!DOCTYPE declarations which includes referencing external entities. saxParserFactory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true); // Create a new parser from this factory SAXParser parser = saxParserFactory.newSAXParser(); // Parse the XML file, passing in a DefaultHandler (which also includes an empty entityResolve method) parser.parse(new FileInputStream(new File("bad.xml")), new DefaultHandler()); ``` For more information on XML security see OWASP's guide: https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html#java

**Why.** Reported as CWE-611. Ported from opengrep rule `gitlab.find_sec_bugs.XXE_SAXPARSER-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
$P.parse(...);
```

Good:

```java
$SF.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
...
$SF.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
...
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.XXE_SAXPARSER-1` (metavariables start with `$`):

- `$SF = SAXParserFactory.newInstance();
...`
- `$SF.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
...`
- `$SF.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
...`
- `$P = $SFP.newSAXParser();
...`
- `$P.parse(...);`
