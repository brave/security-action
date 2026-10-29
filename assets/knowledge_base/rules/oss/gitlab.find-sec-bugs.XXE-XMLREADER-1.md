---
name: oss/gitlab.find-sec-bugs.XXE-XMLREADER-1
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** External XML entities are a feature of XML parsers that allow documents to contain references to other documents or data. This feature can be abused to read files, communicate with external hosts, exfiltrate data, or cause a Denial of Service (DoS). The XMLReaderFactory has been deprecated. It is recommended that [SAXParserFactory](https://docs.oracle.com/javase/9/docs/api/javax/xml/parsers/SAXParserFactory.html) be used instead. Additionally when using the SAXParser it must be configured to disallow doctypes, which will protect against the majority of XXE attacks. Example creating a SAXParser with disallowing the doctypes feature enabled: ``` // Create a SAXParserFactory SAXParserFactory saxParserFactory = SAXParserFactory.newInstance(); // Enable the feature which disallows <!DOCTYPE declarations which includes referencing external entities. saxParserFactory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true); // Create a new parser from this factory SAXParser parser = saxParserFactory.newSAXParser(); // Parse the XML file, passing in a DefaultHandler (which also includes an empty entityResolve method) parser.parse(new FileInputStream(new File("bad.xml")), new DefaultHandler()); ``` For more information on XML security see OWASP's guide: https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html#java

**Why.** Reported as CWE-611. Ported from opengrep rule `gitlab.find_sec_bugs.XXE_XMLREADER-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
$R.parse(...);
```

Good:

```java
$R.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
...
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.XXE_XMLREADER-1` (metavariables start with `$`):

- `$R = XMLReaderFactory.createXMLReader();
...`
- `$R.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
...`
- `$R.parse(...);`
