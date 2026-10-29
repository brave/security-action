---
name: services/template-unescaped-with-safe-noclean
rubric: safety
severity: should_fix
languages: [regex]
cwe: [CWE-79]
---

**Rule.** Detected a segment of a Flask template where autoescaping is explicitly disabled with '| safe' filter. This allows rendering of raw HTML in this segment. Ensure no user data is rendered here, otherwise this is a cross-site scripting (XSS) vulnerability.

**Why.** Reported as CWE-79: Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting'). See https://flask.palletsprojects.com/en/1.1.x/security/#cross-site-scripting-xss. Ported from opengrep rule `template-unescaped-with-safe-noclean` (services/jinja-safe-usages.yaml).

## Examples

Bad:

```text
{{.*?\|\s*safe(\s*}})?
```

Good:

```text
{{.*?clean\s*\|\s*safe(\s*}})?
{{.*?\|\s*safe[^\s}]
```

## Detection hints

Literal patterns from opengrep rule `template-unescaped-with-safe-noclean` (metavariables start with `$`):

- `{{.*?\|\s*safe(\s*}})?`
- `{{.*?clean\s*\|\s*safe(\s*}})?`
- `{{.*?\|\s*safe[^\s}]`
