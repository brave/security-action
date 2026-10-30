---
name: oss/gitlab.find-sec-bugs-scala.STRUTS-FORM-VALIDATION-1
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-20]
---

**Rule.** Form inputs should have minimal input validation. Preventive validation helps provide defense in depth against a variety of risks.

**Why.** Reported as CWE-20. Ported from opengrep rule `gitlab.find_sec_bugs_scala.STRUTS_FORM_VALIDATION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

Good:

```text
public void validate() { ... }
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.STRUTS_FORM_VALIDATION-1` (metavariables start with `$`):

- `class $CLASS extends $SC {
  ...
}`
- `(ActionForm|ValidatorForm)`
- `public void validate() { ... }`
