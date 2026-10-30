---
name: services/var-in-script-tag
rubric: safety
severity: should_fix
languages: [generic]
cwe: [CWE-79]
---

**Rule.** Detected a template variable used in a script tag. Although template variables are HTML escaped, HTML escaping does not always prevent cross-site scripting (XSS) attacks when used directly in JavaScript. If you need this data on the rendered page, consider placing it in the HTML portion (outside of a script tag). Alternatively, use a JavaScript-specific encoder, such as the one available in OWASP ESAPI. For Django, you may also consider using the 'json_script' template tag and retrieving the data in your script by using the element ID (e.g., `document.getElementById`). Use the `tojson` filter for JSON.

**Why.** Reported as CWE-79: Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting'). See https://adamj.eu/tech/2020/02/18/safely-including-data-for-javascript-in-a-django-template/?utm_campaign=Django%2BNewsletter&utm_medium=rss&utm_source=Django_Newsletter_12A. See https://www.veracode.com/blog/secure-development/nodejs-template-engines-why-default-encoders-are-not-enough. See https://github.com/ESAPI/owasp-esapi-js. See https://semgrep.dev/r/generic.html-templates.security.var-in-script-tag.var-in-script-tag. See https://jinja.palletsprojects.com/en/3.0.x/templates/#jinja-filters.tojson. Ported from opengrep rule `var-in-script-tag` (services/var-in-script-tag.yaml).

## Examples

Bad:

```text
{{ ... }}
```

Good:

```text
<script ... $ATTR = "..." ...>
<script ... $ATTR = '...' ...>
{{.*\|\s*tojson\s*}}
```

## Detection hints

Literal patterns from opengrep rule `var-in-script-tag` (metavariables start with `$`):

- `<script ...> ... </script>`
- `<script ... $ATTR = "..." ...>`
- `<script ... $ATTR = '...' ...>`
- `{{ ... }}`
- `{{.*\|\s*tojson\s*}}`
