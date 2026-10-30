---
name: oss/gitlab.find-sec-bugs.XPATH-INJECTION-1
rubric: safety
severity: should_fix
languages: [java]
cwe: [CWE-643]
---

**Rule.** The application processes `XPath` queries with potentially malicious input. An adversary who is able to control the XPath query could potentially influence the logic of how data is retrieved, processed or even bypass protections. To protect against XPath injection, user input should be parameterized using a variable resolver. By creating a class that implements the `XPathVariableResolver` the application can ensure that the xpath query and user-supplied input are treated separately. Example implementation of an XPathVariableResolver: ``` // Create a class which implements the XPathVariableResolver interface public static class SimpleXPathVariableResolver implements XPathVariableResolver { // Use a map or lookup table to store variables for resolution private HashMap<QName, String> variables = new HashMap<>(); // Allow caller to set variables public void setVariable(QName name, String value) { variables.put(name, value); } // Implement the resolveVariable to return the value @Override public Object resolveVariable(QName name) { return variables.getOrDefault(name, ""); } } public static void xpathQuery(String userInput) throws ParseException, ParserConfigurationException, SAXException, IOException, XPathExpressionException { // Create our DocumentFactory DocumentBuilderFactory domFactory = DocumentBuilderFactory.newInstance(); // Enable namespace awareness domFactory.setNamespaceAware(true); // Enable secure processing domFactory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true); // Create our DocumentBuilder DocumentBuilder builder = domFactory.newDocumentBuilder(); // Parse our XML document Document doc = builder.parse("inventory.xml"); // Create a new instance of an XPath object XPath xpathProcessor = XPathFactory.newInstance().newXPath(); // Create our XPathVariableResolver SimpleXPathVariableResolver resolver = new SimpleXPathVariableResolver(); // Add user input as a variable value resolver.setVariable(new QName("author"), userInput); // Configure the processor to use our variable resolver xpathProcessor.setXPathVariableResolver(resolver); // Evaluate the XPath query String result = xpathProcessor.compile("//author[contains(., $author)]").evaluate(doc); // Work with the result // ... } ``` For more information on XPath Injection see: - https://owasp.org/www-community/attacks/XPATH_Injection

**Why.** Reported as CWE-643. Ported from opengrep rule `gitlab.find_sec_bugs.XPATH_INJECTION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
(XPath $X).compile($ARG)
(XPath $X).evaluate($ARG)
```

Good:

```java
(XPath $X).compile("...")
(XPath $X).evaluate("...")
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.XPATH_INJECTION-1` (metavariables start with `$`):

- `import javax.xml.xpath.*; ...`
- `import javax.xml.xpath.XPath; ...`
- `(XPath $X).compile($ARG)`
- `(XPath $X).compile("...")`
- `(XPath $X).evaluate($ARG)`
- `(XPath $X).evaluate("...")`
