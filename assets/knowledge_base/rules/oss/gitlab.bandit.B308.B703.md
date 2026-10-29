---
name: oss/gitlab.bandit.B308.B703
rubric: safety
severity: should_fix
languages: [python]
---

**Rule.** 'mark_safe()' is used to mark a string as "safe" for HTML output. This disables escaping and could therefore subject the content to XSS attacks. Use 'django.utils.html.format_html()' to build HTML for rendering instead.

**Why.** Reported as CWE-79: Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting'). Ported from opengrep rule `gitlab.bandit.B308.B703` (generated/oss/audit.yaml).

## Examples

Bad:

```python
django.utils.safestring.mark_safe(...)
```

Good:

```python
django.utils.html.format_html(...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B308.B703` (metavariables start with `$`):

- `django.utils.html.format_html(...)`
- `django.utils.safestring.mark_safe(...)`
