---
name: services/react-href-var
rubric: safety
severity: should_fix
languages: [typescript, javascript]
cwe: [CWE-79]
---

**Rule.** Detected a variable used in an anchor tag with the 'href' attribute. A malicious actor may be able to input the 'javascript:' URI, which could cause cross-site scripting (XSS). It is recommended to disallow 'javascript:' URIs within your application.

**Why.** Reported as CWE-79: Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting'). Untrusted data matching the source patterns reaches the sink without passing a sanitizer. See https://reactjs.org/blog/2019/08/08/react-v16.9.0.html#deprecating-javascript-urls. See https://pragmaticwebsecurity.com/articles/spasecurity/react-xss-part1.html. Ported from opengrep rule `react-href-var` (services/react-href-var.yaml).

## Examples

Bad:

```text
// untrusted input (source)
$X.$Y
$X[...]
`...${$X}...`
$SANITIZE + <... $X ...>
$A($SOURCE)
$SANITIZE. ... .$A($SOURCE)
$A. ... .$SANITIZE($SOURCE)
// flows to sink without sanitization
<$EL href={$X} />
React.createElement($EL, {href: $X})
```

## Detection hints

Literal patterns from opengrep rule `react-href-var` (metavariables start with `$`):

- `function ...({..., $X, ...}) { ... }`
- `function ...(..., $X, ...) { ... }`
- `$X.$Y`
- `$X[...]`
- `$F. ... .$SANITIZEUNC(...)`
- ``...${$X}...``
- `$SANITIZE + <... $X ...>`
- ``${$X}...``
- `$X + ...`
- `$A($SOURCE)`
- `$SANITIZE. ... .$A($SOURCE)`
- `$A. ... .$SANITIZE($SOURCE)`
- `(?i)(.*valid|.*sanitiz)`
- `<$EL href={$X} />`
- `React.createElement($EL, {href: $X})`
- `$PARAMS = {href: $X};
...
React.createElement($EL, $PARAMS);`
- `(?i)(button|SecureLink)`
