---
name: oss/gitlab.bandit.B703
rubric: safety
severity: should_fix
languages: [python]
---

**Rule.** Cross Site Scripting (XSS) is an attack which exploits a web application or system to treat user input as markup or script code. It is important to encode the data depending on the specific context it is used in. There are at least six context types: - Inside HTML tags `<div>context 1</div>` - Inside attributes: `<div class="context 2"></div>` - Inside event attributes `<button onclick="context 3">button</button>` - Inside script blocks: `<script>var x = "context 4"</script>` - Unsafe element HTML assignment: `element.innerHTML = "context 5"` - Inside URLs: `<iframe src="context 6"></iframe><a href="context 6">link</a>` Script blocks alone have multiple ways they need to be encoded. Extra care must be taken if user input is ever output inside of script tags. User input that is displayed within the application must be encoded, sanitized or validated to ensure it cannot be treated as HTML or executed as Javascript code. Care must also be taken to not mix server-side templating with client-side templating, as the server-side templating will not encode things like {{ 7*7 }} which may execute client-side templating features. It is _NOT_ advised to encode user input prior to inserting into a data store. The data will need to be encoded depending on context of where it is output. It is much safer to force the displaying system to handle the encoding and not attempt to guess how it should be encoded. Consider using [format_html](https://docs.djangoproject.com/en/4.2/ref/utils/#django.utils.html.format_html) instead of the `django.utils.safestring` methods. Example using `format_html`: ``` # Use format_html to create an HTML link, using href as the parameter # which will be encoded automatically format_html("<li><a href='{}'>Some Link</a></li>", href) ``` For more information on XSS see OWASP: - https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html

**Why.** Reported as CWE-79. Ported from opengrep rule `gitlab.bandit.B703` (generated/oss/audit.yaml).

## Examples

Bad:

```python
django.utils.safestring.SafeText(...)
django.utils.safestring.SafeUnicode(...)
django.utils.safestring.SafeString(...)
django.utils.safestring.SafeBytes(...)
django.utils.safestring.mark_safe(...)
```

Good:

```python
django.utils.html.format_html(...)
django.utils.safestring.SafeText("...")
django.utils.safestring.SafeUnicode("...")
django.utils.safestring.SafeString("...")
django.utils.safestring.SafeBytes("...")
django.utils.safestring.mark_safe("...")
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B703` (metavariables start with `$`):

- `django.utils.html.format_html(...)`
- `django.utils.safestring.SafeText(...)`
- `django.utils.safestring.SafeText("...")`
- `django.utils.safestring.SafeUnicode(...)`
- `django.utils.safestring.SafeUnicode("...")`
- `django.utils.safestring.SafeString(...)`
- `django.utils.safestring.SafeString("...")`
- `django.utils.safestring.SafeBytes(...)`
- `django.utils.safestring.SafeBytes("...")`
- `django.utils.safestring.mark_safe(...)`
- `django.utils.safestring.mark_safe("...")`
