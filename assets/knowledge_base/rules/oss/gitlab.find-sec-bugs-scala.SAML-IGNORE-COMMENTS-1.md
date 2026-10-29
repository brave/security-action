---
name: oss/gitlab.find-sec-bugs-scala.SAML-IGNORE-COMMENTS-1
rubric: safety
severity: should_fix
languages: [scala]
---

**Rule.** Ignoring XML comments in SAML may lead to authentication bypass

**Why.** Reported as CWE-287. Ported from opengrep rule `gitlab.find_sec_bugs_scala.SAML_IGNORE_COMMENTS-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.SAML_IGNORE_COMMENTS-1` (metavariables start with `$`):

- `($POOL: BasicParserPool).setIgnoreComments(false);`
