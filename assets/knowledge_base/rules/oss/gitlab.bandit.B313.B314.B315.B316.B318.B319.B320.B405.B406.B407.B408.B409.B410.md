---
name: oss/gitlab.bandit.B313.B314.B315.B316.B318.B319.B320.B405.B406.B407.B408.B409.B410
rubric: safety
severity: should_fix
languages: [python]
cwe: [CWE-611]
---

**Rule.** Found use of the native Python XML libraries, which is vulnerable to XML external entity (XXE) attacks. The Python documentation recommends the 'defusedxml' library instead. Use 'defusedxml'. See https://github.com/tiran/defusedxml for more information.

**Why.** Reported as CWE-611: Improper Restriction of XML External Entity Reference. Ported from opengrep rule `gitlab.bandit.B313.B314.B315.B316.B318.B319.B320.B405.B406.B407.B408.B409.B410` (generated/oss/audit.yaml).

## Examples

Bad:

```python
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B313.B314.B315.B316.B318.B319.B320.B405.B406.B407.B408.B409.B410` (metavariables start with `$`):

- `import xml`
- `import lxml`
- `xml.etree.cElementTree.fromstring(...)`
- `xml.etree.cElementTree.parse(...)`
- `xml.etree.cElementTree.iterparse(...)`
- `xml.etree.cElementTree.XMLParser(...)`
- `xml.etree.ElementTree.fromstring(...)`
- `xml.etree.ElementTree.parse(...)`
- `xml.etree.ElementTree.iterparse(...)`
- `xml.etree.ElementTree.XMLParser(...)`
- `xml.sax.expatreader.create_parser(...)`
- `xml.dom.expatbuilder.parse(...)`
- `xml.dom.expatbuilder.parseString(...)`
- `xml.dom.minidom.parseString(...)`
- `xml.dom.minidom.parse(...)`
- `xml.dom.pulldom.parseString(...)`
- `xml.dom.pulldom.parse(...)`
- `lxml.etree.fromstring(...)`
- `lxml.etree.RestrictedElement(...)`
- `lxml.etree.GlobalParserTLS(...)`
- `lxml.etree.getDefaultParser(...)`
- `lxml.etree.check_docinfo(...)`
