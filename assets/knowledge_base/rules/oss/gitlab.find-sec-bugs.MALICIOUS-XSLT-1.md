---
name: oss/gitlab.find-sec-bugs.MALICIOUS-XSLT-1
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** The application performs XSLT translation with potentially malicious input. An adversary who is able to influence the loaded XSL document could call XSL functions or exploit External XML Entity (XXE) attacks that allow file retrieval or force the parser to connect to arbitrary servers to exfiltrate files. It is strongly recommended that an alternative approach is used to work with XML data. For increased security, never process user-supplied XSL style sheets. If XSLT processing is absolutely necessary, ensure that `FEATURE_SECURE_PROCESSING` is enabled prior to processing the XSLT file: ``` // Create a new TransformerFactory instance TransformerFactory transformerFactory = TransformerFactory.newInstance(); // Enable the FEATURE_SECURE_PROCESSING feature transformerFactory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true); // Read in the XML Source Source xmlSource = new StreamSource(new FileInputStream("hardcoded.xml")); // Read in the XSL template file Source xslSource = new StreamSource(new FileInputStream("hardcoded.xsl")); /// Create the transformer object to do the transformation Transformer transformer = transformerFactory.newTransformer(xslSource); // Create a Result object for output Result result = new StreamResult(System.out); // Execute the transformation process transformer.transform(xmlSource, result); ``` For more information on XML security see OWASP's guide: https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html#java For more information on the secure processing feature see: - https://xml.apache.org/xalan-j/features.html#secureprocessing

**Why.** Reported as CWE-74. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs.MALICIOUS_XSLT-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// untrusted input (source)
new FileInputStream(<... $VAR ...>);
getClass().getResourceAsStream(<... $VAR ...>)
new FileInputStream($X + $Y);
getClass().getResourceAsStream($X + $Y)
// flows to sink without sanitization
$SRC
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.MALICIOUS_XSLT-1` (metavariables start with `$`):

- `$FUNC(...,String $VAR, ...) {
  ...
}`
- `new FileInputStream(<... $VAR ...>);`
- `getClass().getResourceAsStream(<... $VAR ...>)`
- `class $CLZ {
  String $X = "...";
  ...
}`
- `$FUNC(...,String $Y, ...) {
  ...
}`
- `new FileInputStream($X + $Y);`
- `getClass().getResourceAsStream($X + $Y)`
- `(javax.xml.transform.TransformerFactory $T).newTransformer($SRC, ...)`
- `(javax.xml.transform.Transformer $T).transform($SRC, ...)`
- `$SRC`
