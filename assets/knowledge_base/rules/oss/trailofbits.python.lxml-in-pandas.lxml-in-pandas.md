---
name: oss/trailofbits.python.lxml-in-pandas.lxml-in-pandas
rubric: safety
severity: should_fix
languages: [python]
cwe: [CWE-611]
---

**Rule.** Found usage of the `$FLAVOR` library, which is vulnerable to attacks such as XML external entity (XXE) attacks

**Why.** Reported as CWE-611: Improper Restriction of XML External Entity Reference. See https://lxml.de/FAQ.html. Ported from opengrep rule `trailofbits.python.lxml-in-pandas.lxml-in-pandas` (generated/oss/vulns.yaml).

## Examples

Bad:

```python
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.python.lxml-in-pandas.lxml-in-pandas` (metavariables start with `$`):

- `pandas.read_html($IO)`
- `pandas.read_html(**$KWARGS)`
- `...`
- `"bs4"`
- `"html5lib"`
- `pandas.read_html(..., flavor=$FLAVOR, ...)`
- `$KWARGS = {..., "flavor": $FLAVOR, ...}
...`
