---
name: oss/gitlab.security-code-scan.SCS0007-1
rubric: safety
severity: should_fix
languages: [csharp]
---

**Rule.** External XML entities are a feature of XML parsers that allow documents to contain references to other documents or data. This feature can be abused to read files, communicate with external hosts, exfiltrate data, or cause a Denial of Service (DoS). XML parsers and document loaders must be configured to not resolve entities. This can be done by: - Ensuring you are running a version of .NET Framework greater than 4.5.2 (released in 2014). - Using `XDocument` which disables entity resolution and is generally safe from DoS. - Setting `XmlDocument`'s `XmlResolver` to null. - Setting `XmlTextReader`'s `ProhibitDtd` to `true` - Setting `XmlReaderSettings` `DtdProcessing` to `DtdProcessing.Prohibit` Example of safely loading an XML file using `XmlDocument`: ``` XmlDocument document = new XmlDocument(); document.XmlResolver = null; document.Load("users.xml"); ``` For more information on XML security, see OWASP's guide: https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html#net

**Why.** Reported as CWE-611. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.security_code_scan.SCS0007-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// untrusted input (source)
var $SETTINGS = new XmlReaderSettings();
var $DOC = new XmlDocument(...);
var $DOC = new XmlDocument {...};
// flows to sink without sanitization
XmlReader.Create(..., $SETTINGS);
(XmlDocument $DOC).Load(...);
```

Good:

```text
(XmlReaderSettings $SETTINGS).ProhibitDtd = true;
(XmlReaderSettings $SETTINGS).DtdProcessing = DtdProcessing.Prohibit;
(XmlDocument $DOC).XmlResolver = null;
var $DOC = new XmlDocument { ..., XmlResolver = null, ... };
```

## Detection hints

Literal patterns from opengrep rule `gitlab.security_code_scan.SCS0007-1` (metavariables start with `$`):

- `(XmlReaderSettings $SETTINGS).ProhibitDtd = true;`
- `(XmlReaderSettings $SETTINGS).DtdProcessing = DtdProcessing.Prohibit;`
- `(XmlDocument $DOC).XmlResolver = null;`
- `var $DOC = new XmlDocument { ..., XmlResolver = null, ... };`
- `XmlReader.Create(..., $SETTINGS);`
- `(XmlDocument $DOC).Load(...);`
- `var $SETTINGS = new XmlReaderSettings();`
- `var $DOC = new XmlDocument(...);`
- `var $DOC = new XmlDocument {...};`
