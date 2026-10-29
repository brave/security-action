---
name: oss/gitlab.eslint.detect-non-literal-require
rubric: safety
severity: should_fix
languages: [javascript, typescript]
---

**Rule.** The application was found to dynamically import a module by calling `require` using a non-literal string. An adversary might be able to read the first line of arbitrary files. If they had write access to the file system, they may also be able to execute arbitrary code. To remediate this issue, use a hardcoded string literal when calling `require`. Never call it it with dynamically created variables or user-supplied data.

**Why.** Reported as CWE-95. Ported from opengrep rule `gitlab.eslint.detect-non-literal-require` (generated/oss/security_noaudit_novuln.yaml).

## Examples

Bad:

```text
require($OBJ)
```

Good:

```text
require('...')
```

## Detection hints

Literal patterns from opengrep rule `gitlab.eslint.detect-non-literal-require` (metavariables start with `$`):

- `require($OBJ)`
- `require('...')`
