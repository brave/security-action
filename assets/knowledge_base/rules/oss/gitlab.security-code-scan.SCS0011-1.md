---
name: oss/gitlab.security-code-scan.SCS0011-1
rubric: safety
severity: should_fix
languages: [csharp]
---

**Rule.** By setting `XsltSettings.EnableScript` to true, an adversary who is able to influence the loaded XSL document could directly inject code to compromise the system. It is strongly recommended that an alternative approach is used to work with XML data. For increased security: - Never process user-supplied XSL style sheets - Ensure `XsltSettings.EnableScript` is set to false - Ensure `XsltSettings.EnableDocumentFunction` is set to false If the application must calculate values from XML input, instead of using XSL scripts to execute functions, modify the XML document prior to running the `XslCompiledTransform.Transform` method. Example of modifying the XML prior to running `Transform`: ``` const String filename = "number.xml"; const String stylesheet = "calc.xsl"; // Compile the style sheet. XsltSettings xslt_settings = new XsltSettings(); xslt_settings.EnableScript = false; // disable script xslt_settings.EnableDocumentFunction = false; // disable document() function XslCompiledTransform xslt = new XslCompiledTransform(); XmlResolver resolver = null; // set a null entity resolver xslt.Load(stylesheet, xslt_settings, resolver); // Load the XML source file, using XDocument for safety XDocument doc = XDocument.Load(filename); // do our modifications to the document before the transformation // instead of inside of a script. doc.Element("data").Add(new XElement("circle", new XElement("radius", 12))); // Create an XmlWriter. XmlWriterSettings settings = new XmlWriterSettings(); settings.OmitXmlDeclaration = true; settings.Indent = true; XmlWriter writer = XmlWriter.Create("output.xml", settings); // Finally, execute the transformation. xslt.Transform(doc.CreateReader(), writer); writer.Close(); ``` For more information on security considerations when using XSL see the following URLs: - https://learn.microsoft.com/en-us/dotnet/standard/data/xml/xslt-security-considerations - https://learn.microsoft.com/en-us/dotnet/api/system.xml.xsl.xslcompiledtransform?view=net-7.0#security-considerations

**Why.** Reported as CWE-611. Ported from opengrep rule `gitlab.security_code_scan.SCS0011-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
new XsltSettings() {EnableScript = true};
var $SETTINGS = new XsltSettings();
...
$SETTINGS.EnableScript = true;
```

## Detection hints

Literal patterns from opengrep rule `gitlab.security_code_scan.SCS0011-1` (metavariables start with `$`):

- `new XsltSettings() {EnableScript = true};`
- `var $SETTINGS = new XsltSettings();
...
$SETTINGS.EnableScript = true;`
