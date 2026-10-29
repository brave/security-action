---
name: oss/gitlab.eslint.detect-non-literal-regexp
rubric: safety
severity: should_fix
languages: [javascript, typescript]
---

**Rule.** The `RegExp` constructor was called with a non-literal value. If an adversary were able to supply a malicious regex, they could cause a Regular Expression Denial of Service (ReDoS) against the application. In Node applications, this could cause the entire application to no longer be responsive to other users' requests. To remediate this issue, never allow user-supplied regular expressions. Instead, the regular expression should be hardcoded. If this is not possible, consider using an alternative regular expression engine such as [node-re2](https://www.npmjs.com/package/re2). RE2 is a safe alternative that does not support backtracking, which is what leads to ReDoS. Example using re2 which does not support backtracking (Note: it is still recommended to never use user-supplied input): ``` // Import the re2 module const RE2 = require('re2'); function match(userSuppliedRegex, userInput) { // Create a RE2 object with the user supplied regex, this is relatively safe // due to RE2 not supporting backtracking which can be abused to cause long running // queries var re = new RE2(userSuppliedRegex); // Execute the regular expression against some userInput var result = re.exec(userInput); // Work with the result } ``` For more information on Regular Expression DoS see: - https://owasp.org/www-community/attacks/Regular_expression_Denial_of_Service_-_ReDoS

**Why.** Reported as CWE-185. Ported from opengrep rule `gitlab.eslint.detect-non-literal-regexp` (generated/oss/security_noaudit_novuln.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.eslint.detect-non-literal-regexp` (metavariables start with `$`):

- `new RegExp(...)`
- `new RegExp("...", ...)`
- `new RegExp(/.../, ...)`
- `RegExp(...)`
- `RegExp("...", ...)`
- `RegExp(/.../, ...)`
- `"...".$METHOD(...)`
- `"...".$METHOD("...")`
- `"...".$METHOD(/.../)`
- `^(match|search)$`
