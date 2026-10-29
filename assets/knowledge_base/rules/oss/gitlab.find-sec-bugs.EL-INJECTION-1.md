---
name: oss/gitlab.find-sec-bugs.EL-INJECTION-1
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** This rule identifies potential Expression Language (EL) injection vulnerabilities within Java applications. The rule targets use of `createValueExpression`, `createMethodExpression`, `ELProcessor.eval`, `getValue`, and `setValue` methods, particularly when input to these methods is not a hardcoded string, indicating dynamic evaluation of potentially untrusted input. `createValueExpression` creates a `ValueExpression` object which gets evaluated upon calling methods like `getValue()` and `setValue()` or a Lambda `invoke()` i.e. it evaluates the expression passed to the `createValueExpression` method. Similarly, `createMethodExpression` creates a `MethodExpression` object which gets evaluated upon calling methods like `invoke()` and `getMethodInfo()`. `ELProcessor.eval`, `getValue()`, and `setValue()` methods all evaluate their expressions which are passed as parameters. Calling these method directly with user-supplied input may allow an adversary to execute arbitrary Java code, including OS system commands. Never call these methods directly with user-supplied input. Consider alternate methods such as a lookup table to take user input and resolve hardcoded values. Secure example: ``` import javax.el.ELProcessor; import java.util.Set; public class SafeELHandling { private static final Set<String> ALLOWED_VALUES = Set.of("value1", "value2", "value3"); public void processInput(String userInput) { // Validate user input against the allowlist if (!ALLOWED_VALUES.contains(userInput)) { throw new IllegalArgumentException("Invalid input"); } ELProcessor elProcessor = new ELProcessor(); elProcessor.defineBean("userInput", userInput); // Example EL expression using the safe, predefined input String result = (String) elProcessor.eval(userInput); } } ```

**Why.** Reported as CWE-917. Ported from opengrep rule `gitlab.find_sec_bugs.EL_INJECTION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.EL_INJECTION-1` (metavariables start with `$`):

- `(ExpressionFactory $EXP).createValueExpression((ELContext $CTX), $EXPR,
...)`
- `(ExpressionFactory $EXP).createValueExpression((ELContext $CTX), "...",
...)`
- `(ExpressionFactory $EXP).createMethodExpression((ELContext $CTX), $EXPR,
...)`
- `(ExpressionFactory $EXP).createMethodExpression((ELContext $CTX), "...",
...)`
- `($X.el.ELProcessor $P).eval(...)`
- `($X.el.ELProcessor $P).eval("...", ...)`
- `($X.el.ELProcessor $P).getValue(...)`
- `($X.el.ELProcessor $P).getValue("...", ...)`
- `($X.el.ELProcessor $P).setValue(...)`
- `($X.el.ELProcessor $P).setValue("...", "...")`
