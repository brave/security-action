---
name: oss/gitlab.find-sec-bugs-kotlin.SAML-IGNORE-COMMENTS-1
rubric: safety
severity: should_fix
languages: [kotlin]
---

**Rule.** Ignoring XML comments in SAML may lead to authentication bypass

**Why.** Reported as CWE-287. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.SAML_IGNORE_COMMENTS-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.SAML_IGNORE_COMMENTS-1` (metavariables start with `$`):

- `($POOL: org.opensaml.xml.parse.BasicParserPool).setIgnoreComments(false);`
