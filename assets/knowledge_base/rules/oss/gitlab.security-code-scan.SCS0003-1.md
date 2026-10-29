---
name: oss/gitlab.security-code-scan.SCS0003-1
rubric: safety
severity: nit
languages: [csharp]
---

**Rule.** XPath injection is a vulnerability that can allow an adversary to inject or modify how an XML query is structured. Depending on the logic of the original query, this could lead to adversaries extracting unauthorized information or in rare cases bypassing authorization checks. It is recommended that LINQ to XML is used instead of XPath for querying XML documents. Care must be taken to **not** call these LINQ functions with user input as they can still lead to XPath injection: - `XPathEvaluate` - `XPathSelectElement` - `XPathSelectElements` Example using LINQ to XML to safely extract the first user from a list of users: ``` // XDocument is safe from XXE attacks as the resolver is disabled by default XDocument doc = XDocument.Load("users.xml"); XNamespace ns = "urn:users-schema"; string userInput = "LastName"; // Get all the users. var user = doc.Descendants(ns + "user") .Select(u => new { FirstName = (string)u.Element(ns + "first-name"), LastName = (string)u.Element(ns + "last-name") }).Where(u => u.LastName == userInput).FirstOrDefault(); Console.WriteLine(user.FirstName + " " + user.LastName); ``` For more information on LINQ to XML security see: https://learn.microsoft.com/en-us/dotnet/standard/linq/linq-xml-security For more information on XML security see OWASP's guide: https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html#net

**Why.** Reported as CWE-643. Ported from opengrep rule `gitlab.security_code_scan.SCS0003-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
($TY $VAR).$FUNC(<...$ARG...>, ...)
$VAR.$FUNC(<...$ARG...>, ...)
$VAR.XPath = <...$ARG...>;
new XmlSchemaXPath { XPath = <...$ARG...> };
```

Good:

```text
($TY $VAR).$FUNC("...", ...)
$VAR.$FUNC("...", ...)
$VAR.XPath = "..."
```

## Detection hints

Literal patterns from opengrep rule `gitlab.security_code_scan.SCS0003-1` (metavariables start with `$`):

- `using System.Xml;
...`
- `^(SelectNodes|SelectSingleNode|Compile|Evaluate|Matches|Select|SelectAncestors|SelectChildren|SelectDescendants)$`
- `^(XPathNavigator|XmlDocument|XmlNode|XmlDocumentXPathExtensions)$`
- `($TY $VAR).$FUNC(<...$ARG...>, ...)`
- `($TY $VAR).$FUNC("...", ...)`
- `using System.Xml.Linq;
...`
- `^(XPathEvaluate|XPathSelectElement|XPathSelectElements)$`
- `$VAR.$FUNC(<...$ARG...>, ...)`
- `$VAR.$FUNC("...", ...)`
- `using System.Xml.Schema;
...`
- `$VAR.XPath = <...$ARG...>;`
- `$VAR.XPath = "..."`
- `new XmlSchemaXPath { XPath = <...$ARG...> };`
