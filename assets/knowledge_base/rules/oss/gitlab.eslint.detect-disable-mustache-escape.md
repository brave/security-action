---
name: oss/gitlab.eslint.detect-disable-mustache-escape
rubric: safety
severity: should_fix
languages: [javascript, typescript]
cwe: [CWE-79]
---

**Rule.** Markup escaping disabled. This can be used with some template engines to escape disabling of HTML entities, which can lead to XSS attacks.

**Why.** Reported as CWE-79. Ported from opengrep rule `gitlab.eslint.detect-disable-mustache-escape` (generated/oss/security_noaudit_novuln.yaml).

## Examples

Bad:

```text
$OBJ.escape = function($TEXT) {
  ...
  return $TEXT;
}
$OBJ.render($X, ... )
$OBJ.render($Y, ... )
```

## Detection hints

Literal patterns from opengrep rule `gitlab.eslint.detect-disable-mustache-escape` (metavariables start with `$`):

- `$OBJ = require('mustache')
...`
- `$OBJ.escape = function($TEXT) {
  ...
  return $TEXT;
}`
- `"\{\{\{(.+?)\}\}\}"`
- `$OBJ.render($X, ... )`
- `"\{\{\&(.+?)\}\}"`
- `$OBJ.render($Y, ... )`
