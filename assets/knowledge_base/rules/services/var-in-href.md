---
name: services/var-in-href
rubric: safety
severity: should_fix
languages: [generic]
---

**Rule.** Detected a template variable used in an anchor tag with the 'href' attribute. This allows a malicious actor to input the 'javascript:' URI and is subject to cross- site scripting (XSS) attacks. If using Flask, use 'url_for()' to safely generate a URL. If using Django, use the 'url' filter to safely generate a URL. If using Mustache, use a URL encoding library, or prepend 'https://' to the variable for relative links (`href="https://{{link}}"`). You may also consider setting the Content Security Policy (CSP) header.

**Why.** Reported as CWE-79: Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting'). See https://flask.palletsprojects.com/en/1.1.x/security/#cross-site-scripting-xss#:~:text=javascript:%20URI. See https://docs.djangoproject.com/en/3.1/ref/templates/builtins/#url. See https://github.com/pugjs/pug/issues/2952. See https://content-security-policy.com/. See https://semgrep.dev/r/generic.html-templates.security.var-in-href.var-in-href. Ported from opengrep rule `var-in-href` (services/var-in-href.yaml).

## Examples

Bad:

```text
href = {{ ... }}
href = "{{ ... }}"
href = '{{ ... }}'
```

Good:

```text
href = {{ url_for(...) ... }}
href = "{{ url_for(...) ... }}"
href = '{{ url_for(...) ... }}'
href = "/{{ ... }}"
href = '/{{ ... }}'
.*\|\s*sanitize_url\s*\}\}.
```

## Detection hints

Literal patterns from opengrep rule `var-in-href` (metavariables start with `$`):

- `<a ...>`
- `href = {{ ... }}`
- `href = "{{ ... }}"`
- `href = '{{ ... }}'`
- `href = {{ url_for(...) ... }}`
- `href = "{{ url_for(...) ... }}"`
- `href = '{{ url_for(...) ... }}'`
- `href = "/{{ ... }}"`
- `href = '/{{ ... }}'`
- `.*\|\s*sanitize_url\s*\}\}.`
