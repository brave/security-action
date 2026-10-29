---
name: oss/gitlab.bandit.B313
rubric: safety
severity: should_fix
languages: [python]
---

**Rule.** The application was found using the `xml.etree` package for processing XML. Pythons default xml processors suffer from various XML parsing vulnerabilities and care must be taken when handling XML data. Additionally, depending on the version of Python, more critical vulnerabilities such as eXternal XML Entity injection maybe exploitable. The `etree` package suffers from the following security risks as of Python 3.7.1: * Billion laughs / exponential entity expansion - May allow an adversary to cause a Denial of Service (DoS) against the application parsing arbitrary XML. * Quadratic blowup entity expansion - Similar to above, but requires a larger input to cause the Denial of Service. To remediate the above issues, consider using the [defusedxml](https://pypi.org/project/defusedxml/) library when processing untrusted XML. Example parsing an XML document using defusedxml: ``` from defusedxml.ElementTree import parse # Parse the inventory.xml file et = parse('inventory.xml') # Get the root element root = et.getroot() # Work with the root element # ... ``` For more information on the various XML parsers and their vulnerabilities please see: - https://docs.python.org/3/library/xml.html#xml-vulnerabilities For more information on XML security see OWASP's guide: - https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html#python

**Why.** Reported as CWE-611. Ported from opengrep rule `gitlab.bandit.B313` (generated/oss/audit.yaml).

## Examples

Bad:

```python
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B313` (metavariables start with `$`):

- `xml.etree.cElementTree.fromstring(...)`
- `xml.etree.cElementTree.fromstring("...")`
- `xml.etree.cElementTree.parse(...)`
- `xml.etree.cElementTree.iterparse(...)`
- `xml.etree.cElementTree.XMLParser(...)`
