---
name: oss/gitlab.find-sec-bugs-scala.XML-DECODER-1
rubric: safety
severity: should_fix
languages: [scala]
---

**Rule.** Avoid using XMLDecoder to parse content from an untrusted source.

**Why.** Reported as CWE-502. Ported from opengrep rule `gitlab.find_sec_bugs_scala.XML_DECODER-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
$D.readObject
```

Good:

```text
$DX = new java.beans.XMLDecoder("...");
...
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.XML_DECODER-1` (metavariables start with `$`):

- `$D = new java.beans.XMLDecoder($IN);
...`
- `$DX = new java.beans.XMLDecoder("...");
...`
- `$D.readObject`
