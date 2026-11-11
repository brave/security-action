---
name: oss/gitlab.eslint.react-dangerouslysetinnerhtml
rubric: safety
severity: should_fix
languages: [typescript, javascript]
cwe: [CWE-79]
---

**Rule.** The application was found calling `dangerouslySetInnerHTML` which may lead to Cross Site Scripting (XSS). By default, React components will encode the data properly before rendering. Calling `dangerouslySetInnerHTML` disables this encoding and allows raw markup and JavaScript to be executed. XSS is an attack which exploits a web application or system to treat user input as markup or script code. It is important to encode the data, depending on the specific context it is used in. There are at least six context types: - Inside HTML tags `<div>context 1</div>` - Inside attributes: `<div class="context 2"></div>` - Inside event attributes `<button onclick="context 3">button</button>` - Inside script blocks: `<script>var x = "context 4"</script>` - Unsafe element HTML assignment: `element.innerHTML = "context 5"` - Inside URLs: `<iframe src="context 6"></iframe><a href="context 6">link</a>` Script blocks alone have multiple ways they need to be encoded. Extra care must be taken if user input is ever output inside of script tags. User input that is displayed within the application must be encoded, sanitized or validated to ensure it cannot be treated as HTML or executed as Javascript code. Care must also be taken to not mix server-side templating with client-side templating, as the server-side templating will not encode things like {{ 7*7 }} which may execute client-side templating features. It is _NOT_ advised to encode user input prior to inserting into a data store. The data will need to be encoded depending on context of where it is output. It is much safer to force the displaying system to handle the encoding and not attempt to guess how it should be encoded. Remove the call to `dangerouslySetInnerHTML` or ensure that the data used in this call does not come from user-supplied input. For more information on dangerously setting inner HTML see: - https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html

**Why.** Reported as CWE-79. Ported from opengrep rule `gitlab.eslint.react-dangerouslysetinnerhtml` (generated/oss/security_noaudit_novuln.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.eslint.react-dangerouslysetinnerhtml` (metavariables start with `$`):

- `<$X dangerouslySetInnerHTML=... />`
- `{dangerouslySetInnerHTML: ...}`
