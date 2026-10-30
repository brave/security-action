---
name: oss/gitlab.bandit.B701
rubric: safety
severity: should_fix
languages: [python]
cwe: [CWE-116]
---

**Rule.** The application was found using Jinja2 `Environment` without autoescaping enabled. If using in the context of HTML this could lead to Cross-Site Scripting (XSS) attacks when rendering with user-supplied input. Unfortunately, Jinja2 does not support context-aware escaping, meaning it is insufficient to protect against XSS for the various web contexts. It is important to encode the data depending on the specific context it is used in. There are at least six context types: - Inside HTML tags `<div>context 1</div>` - Inside attributes: `<div class="context 2"></div>` - Inside event attributes `<button onclick="context 3">button</button>` - Inside script blocks: `<script>var x = "context 4"</script>` - Unsafe element HTML assignment: `element.innerHTML = "context 5"` - Inside URLs: `<iframe src="context 6"></iframe><a href="context 6">link</a>` Script blocks alone have multiple ways they need to be encoded. Extra care must be taken if user input is ever output inside of script tags. User input that is displayed within the application must be encoded, sanitized or validated to ensure it cannot be treated as HTML or executed as Javascript code. Care must also be taken to not mix server-side templating with client-side templating, as the server-side templating will not encode things like {{ 7*7 }} which may execute client-side templating features. It is _NOT_ advised to encode user input prior to inserting into a data store. The data will need to be encoded depending on context of where it is output. It is much safer to force the displaying system to handle the encoding and not attempt to guess how it should be encoded. To handle different contexts, one approach would be to write custom Jinja2 filters. Below is an example that escapes or encodes links and potentially malicious script, note this does not include other contexts such as CSS or attributes: ``` from jinja2 import Environment, select_autoescape, FileSystemLoader from jinja2 import pass_eval_context from markupsafe import Markup, escape @pass_eval_context def escape_link(eval_ctx, value): bad_link = "#JinjatmplZ" # Block any values that start with // as that could be used to inject # links to third party pages see: https://en.wikipedia.org/wiki/Wikipedia:Protocol-relative_URL if value.startswith('//'): return bad_link # Only allow relative links # if you want to allow links that start with http or ws replace with below: # if not value.startswith('/'): and not value.startswith('http') and not value.startswith('ws') if not value.startswith('/'): return bad_link # Alternatively, you could only call escape if autoescape is true # if eval_ctx.autoescape: # return escape(value) # else # return value return escape(value) # Create a replacement table js_replacement = str.maketrans({ '"': "\\u0022", '`': "\\u0060", '&': "\\u0026", '\'': "\\u0027", '+': "\\u002b", '/': "\\/", '<': "\\u003c", '>': "\\u003e", '\\': "\\\\", '(': "\\u0028", ')': "\\u0029", }) @pass_eval_context def escape_js(eval_ctx, value): """ Escape the input for use in <script> context, USE WITH CAUTION It is strongly recommended to _never_ pass user-supplied input to the JavaScript context. This may still be unsafe depending where used, it does not consider characters used in regular expressions for example. """ #if eval_ctx.autoescape: # value = escape(value) # Escape by default value = escape(value) # Translate any potential characters using our translation table return value.translate(js_replacement) # Create our environment, setting autoescape to use the default # select_autoescape function env = Environment( loader=FileSystemLoader(os.getcwd()+"/template"), autoescape=select_autoescape, ) # Add an escape link filter to be used in our template env.filters["escape_link"] = escape_link env.filters["escape_js"] = escape_js # Load our template file template = env.get_template("mytemplate.html") # Render with different variables which call our filters print(template.render( html_context="<img src=x onerror=alert(1)>", link_context="/# onclick=alert(1)<script>alert(1)</script>", script_context="alert(1);alert`1`",) ) # Sample template: """ <!DOCTYPE html> <html lang="en"> <head> <title>My Webpage</title> </head> <body> <h1>My Webpage</h1> {{ html_context }} <a href="{{ link_context | escape_link }}">link</a> <script>{{ script_context | escape_js }}</script> </body> </html> """ ``` For more information on autoescape see: - https://jinja.palletsprojects.com/en/3.1.x/api/#autoescaping For more information on XSS see OWASP: - https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html

**Why.** Reported as CWE-116. Ported from opengrep rule `gitlab.bandit.B701` (generated/oss/audit.yaml).

## Examples

Bad:

```python
jinja2.Environment(...)
```

Good:

```python
jinja2.Environment(..., autoescape=True, ...)
jinja2.Environment(..., autoescape=jinja2.select_autoescape(...), ...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B701` (metavariables start with `$`):

- `jinja2.Environment(..., autoescape=True, ...)`
- `jinja2.Environment(..., autoescape=jinja2.select_autoescape(...), ...)`
- `jinja2.Environment(...)`
