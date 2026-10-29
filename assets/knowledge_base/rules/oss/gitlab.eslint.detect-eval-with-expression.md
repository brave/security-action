---
name: oss/gitlab.eslint.detect-eval-with-expression
rubric: safety
severity: should_fix
languages: [javascript, typescript]
---

**Rule.** The application was found calling the `eval` function OR Function() constructor OR setTimeout() OR setInterval() methods. If the variables or strings or functions passed to these methods contains user-supplied input, an adversary could attempt to execute arbitrary JavaScript code. This could lead to a full system compromise in Node applications or Cross-site Scripting (XSS) in web applications. To remediate this issue, remove all calls to above methods and consider alternative methods for executing the necessary business logic. There is almost no safe method of calling `eval` or other above stated sinks with user-supplied input. Instead, consider alternative methods such as using property accessors to dynamically access values. Example using property accessors to dynamically access an object's property: ``` // Define an object const obj = {key1: 'value1', key2: 'value2'}; // Get key dynamically from user input const key = getUserInput(); // Check if the key exists in our object and return it, or a default empty string const value = (obj.hasOwnProperty(key)) ? obj[key] : ''; // Work with the value ``` For more information on why not to use `eval`, and alternatives see: - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#never_use_eval! Other References: - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/Function - https://developer.mozilla.org/en-US/docs/Web/API/setTimeout - https://developer.mozilla.org/en-US/docs/Web/API/setInterval

**Why.** Reported as CWE-95. Ported from opengrep rule `gitlab.eslint.detect-eval-with-expression` (generated/oss/security_noaudit_novuln.yaml).

## Examples

Bad:

```text
eval($OBJ)
$A.eval($OBJ)
(..., eval)($OBJ)
$ALIAS = eval;
...
$ALIAS($OBJ)
new Function(..., "..." + $OBJ + "...")
$BODY = "..." + $OBJ + "..."
...
new Function(..., $BODY)
new Function(..., `...${...}...`)
$BODY = `...${...}...`
...
new Function(..., $BODY)
Function(..., "..." + $OBJ + "...")
$BODY = "..." + $OBJ + "..."
...
Function(..., $BODY)
$BODY = `...${...}...`
...
Function(..., $BODY)
Function(..., `...${...}...`)
setTimeout("..." + $OBJ + "...", ...)
setTimeout(`...${...}...`, ...)
setInterval("..." + $OBJ + "...", ...)
setInterval(`...${...}...`, ...)
```

Good:

```text
eval("...")
$A.eval("...")
(..., eval)("...")
$ALIAS = eval;
...
$ALIAS("...")
setTimeout("...", ...)
setInterval("...", ...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.eslint.detect-eval-with-expression` (metavariables start with `$`):

- `eval($OBJ)`
- `eval("...")`
- `$A.eval($OBJ)`
- `$A.eval("...")`
- `(..., eval)($OBJ)`
- `(..., eval)("...")`
- `$ALIAS = eval;
...
$ALIAS($OBJ)`
- `$ALIAS = eval;
...
$ALIAS("...")`
- `new Function(..., "..." + $OBJ + "...")`
- `$BODY = "..." + $OBJ + "..."
...
new Function(..., $BODY)`
- `new Function(..., `...${...}...`)`
- `$BODY = `...${...}...`
...
new Function(..., $BODY)`
- `Function(..., "..." + $OBJ + "...")`
- `$BODY = "..." + $OBJ + "..."
...
Function(..., $BODY)`
- `$BODY = `...${...}...`
...
Function(..., $BODY)`
- `Function(..., `...${...}...`)`
- `setTimeout("..." + $OBJ + "...", ...)`
- `setTimeout(`...${...}...`, ...)`
- `setInterval("..." + $OBJ + "...", ...)`
- `setInterval(`...${...}...`, ...)`
- `setTimeout("...", ...)`
- `setInterval("...", ...)`
