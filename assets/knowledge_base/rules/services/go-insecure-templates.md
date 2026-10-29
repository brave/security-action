---
name: services/go-insecure-templates
rubric: safety
severity: should_fix
languages: [go]
---

**Rule.** usage of insecure template types. They are documented as a security risk. See https://golang.org/pkg/html/template/#HTML.

**Why.** Reported as CWE-79: Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting'). See https://golang.org/pkg/html/template/#HTML. See https://twitter.com/empijei/status/1275177219011350528. Ported from opengrep rule `go-insecure-templates` (services/insecure-types.yaml).

## Examples

Bad:

```go
var $VAR template.HTML = $EXP
var $VAR template.CSS = $EXP
var $VAR template.HTMLAttr = $EXP
var $VAR template.JS = $EXP
var $VAR template.JSStr = $EXP
var $VAR template.Srcset = $EXP
```

## Detection hints

Literal patterns from opengrep rule `go-insecure-templates` (metavariables start with `$`):

- `import "html/template"
...`
- `var $VAR template.HTML = $EXP`
- `var $VAR template.CSS = $EXP`
- `var $VAR template.HTMLAttr = $EXP`
- `var $VAR template.JS = $EXP`
- `var $VAR template.JSStr = $EXP`
- `var $VAR template.Srcset = $EXP`
