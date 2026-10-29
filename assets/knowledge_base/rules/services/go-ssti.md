---
name: services/go-ssti
rubric: safety
severity: should_fix
languages: [go]
---

**Rule.** A server-side template injection occurs when an attacker is able to use native template syntax to inject a malicious payload into a template, which is then executed server-side. When using "html/template" always check that user inputs are validated and sanitized before included within the template.

**Why.** Reported as CWE-1336: Improper Neutralization of Special Elements Used in a Template Engine. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. See https://www.onsecurity.io/blog/go-ssti-method-research/. See http://blog.takemyhand.xyz/2020/05/ssti-breaking-gos-template-engine-to.html. Ported from opengrep rule `go-ssti` (services/ssti.yaml).

## Examples

Bad:

```go
// untrusted input (source)
$REQ.URL.Query().Get(...)
$REQ.Form.Get(...)
$REQ.PostForm.Get(...)
$REQ.FormValue(...)
$REQ.PostFormValue(...)
// flows to sink without sanitization
var $TEMPLATE = fmt.Sprintf("...", ...)
$TEMPLATE := fmt.Sprintf("...", ...)
$TEMPLATE = fmt.Sprintf("...", ...)
```

Good:

```go
html.EscapeString($X)
template.HTMLEscapeString($X)
$SANITIZE($X)
```

## Detection hints

Literal patterns from opengrep rule `go-ssti` (metavariables start with `$`):

- `func $FN(..., $REQ *http.Request, ...){
...
}`
- `func $FN(..., $REQ http.Request, ...){
...
}`
- `func(..., $REQ *http.Request, ...){
...
}`
- `$REQ.URL.Query().Get(...)`
- `$REQ.Form.Get(...)`
- `$REQ.PostForm.Get(...)`
- `$REQ.FormValue(...)`
- `$REQ.PostFormValue(...)`
- `html.EscapeString($X)`
- `template.HTMLEscapeString($X)`
- `$SANITIZE($X)`
- `(?i)(sanitize|validate|escape|clean)`
- `import ("html/template")
...`
- `var $TEMPLATE = fmt.Sprintf("...", ...)`
- `$TEMPLATE := fmt.Sprintf("...", ...)`
- `$TEMPLATE = fmt.Sprintf("...", ...)`
