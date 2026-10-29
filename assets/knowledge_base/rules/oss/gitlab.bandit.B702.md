---
name: oss/gitlab.bandit.B702
rubric: safety
severity: should_fix
languages: [python]
cwe: [CWE-79]
---

**Rule.** The application was found using mako templates without `default_filters` being passed to the `Template` or `TemplateLookup` constructors. If using in the context of HTML, this could lead to Cross-Site Scripting (XSS) attacks when rendering with user-supplied input. Unfortunately, Jinja2 does not support context-aware escaping, meaning it is insufficient to protect against XSS for the various web contexts. It is important to encode the data depending on the specific context it is used in. There are at least six context types: - Inside HTML tags `<div>context 1</div>` - Inside attributes: `<div class="context 2"></div>` - Inside event attributes `<button onclick="context 3">button</button>` - Inside script blocks: `<script>var x = "context 4"</script>` - Unsafe element HTML assignment: `element.innerHTML = "context 5"` - Inside URLs: `<iframe src="context 6"></iframe><a href="context 6">link</a>` Script blocks alone have multiple ways they need to be encoded. Extra care must be taken if user input is ever output inside of script tags. User input that is displayed within the application must be encoded, sanitized or validated to ensure it cannot be treated as HTML or executed as Javascript code. Care must also be taken to not mix server-side templating with client-side templating, as the server-side templating will not encode things like {{ 7*7 }} which may execute client-side templating features. It is _NOT_ advised to encode user input prior to inserting into a data store. The data will need to be encoded depending on context of where it is output. It is much safer to force the displaying system to handle the encoding and not attempt to guess how it should be encoded. To handle different contexts, one approach would be to write custom mako filters. Below is an example that escapes or encodes links and potentially malicious script, note this does not include other contexts such as CSS or attributes: ``` # filters.py module: def escape_link(value): bad_link = "#JinjatmplZ" # Block any values that start with // as that could be used to inject # links to third party pages see: https://en.wikipedia.org/wiki/Wikipedia:Protocol-relative_URL if value.startswith('//'): return bad_link # Only allow relative links # if you want to allow links that start with http or ws replace with below: # if not value.startswith('/'): and not value.startswith('http') and not value.startswith('ws') if not value.startswith('/'): return bad_link return value # Create a replacement table js_replacement = str.maketrans({ '\0': "\\u0000", '\t': "\\t", '\n': "\\n", '\v': "\\u000b", '\f': "\\f`", '\r': "\\r", '"': "\\u0022", '`': "\\u0060", '&': "\\u0026", '\'': "\\u0027", '+': "\\u002b", '/': "\\/", '<': "\\u003c", '>': "\\u003e", '\\': "\\\\", '(': "\\u0028", ')': "\\u0029", }) def escape_js(value): # Escape the input for use in <script> context, USE WITH CAUTION # It is strongly recommended to never pass user-supplied input to # the JavaScript context. # Translate any potential characters using our translation table return value.translate(js_replacement) ##################################################################### # main module: # ##################################################################### from mako.template import Template # Define our template, note the calls to our custom filters depending # on context template_text = """ <!DOCTYPE html> <html lang="en"> <head> <title>My Webpage</title> </head> <body> <h1>My Webpage</h1> ${html_context} <a href="${link_context | escape_link}">link</a> <script>${script_context | escape_js}</script> </body> </html> """ # Load our template with default filters and our imported filters for # usage in template files t = Template(template_text, # By default enable the html filter with 'h' default_filters=['h'], # Import our custom filters imports=["from filters import escape_link, escape_js"]) # Render our template print(t.render(html_context="<img src=x onerror=alert(1)>", link_context="/# onclick=alert(1)<script>alert(1)</script>", script_context="alert(1)<img src=x onerror=alert(1)>",) ) ```

**Why.** Reported as CWE-79. Ported from opengrep rule `gitlab.bandit.B702` (generated/oss/audit.yaml).

## Examples

Bad:

```python
mako.template.Template(...)
mako.lookup.TemplateLookup(...)
```

Good:

```python
mako.lookup.TemplateLookup(..., default_filters=["..."])
mako.template.Template(..., default_filters=["..."])
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B702` (metavariables start with `$`):

- `mako.template.Template(...)`
- `mako.lookup.TemplateLookup(...)`
- `mako.lookup.TemplateLookup(..., default_filters=["..."])`
- `mako.template.Template(..., default_filters=["..."])`
