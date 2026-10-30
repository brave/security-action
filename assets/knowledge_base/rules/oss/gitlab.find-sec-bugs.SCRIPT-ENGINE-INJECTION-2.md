---
name: oss/gitlab.find-sec-bugs.SCRIPT-ENGINE-INJECTION-2
rubric: safety
severity: should_fix
languages: [java]
cwe: [CWE-917]
---

**Rule.** The application was found calling SpringFramework's `SpelExpressionParser.parseExpression`. Calling this method directly with user-supplied input may allow an adversary to execute arbitrary Java code including OS system commands. Never call `parseExpression` or `parseRaw` directly with user-supplied input. Consider alternate methods such as a lookup table to take user input and resolve hardcoded values. Later versions of SpringFramework introduced a `SimpleEvaluationContext` which can be used to access bound data when calling the `getValue` result of `parseExpression`. This `SimpleEvaluationContext` has a reduced set of functionality and can restrict data binding to read-only or read-write contexts. An adversary could still access public properties or fields on custom types that have been provided to the evaluation context. Use with caution. Example using `SimpleEvaluationContext` with a read-write data binding context: ``` @RequestMapping(value="/spel", method=RequestMethod.POST) public String spel(@Validated User user, Model model) { // Create the Expression Parser SpelExpressionParser parser = new SpelExpressionParser(); // Parse the expression Expression parsedExpression = parser.parseExpression(model.getPossiblyUnsafeData()); // Create the read-write data binding context SimpleEvaluationContext context = SimpleEvaluationContext.forReadWriteDataBinding().build(); // Execute the expression, passing in the read-write context Object result = parsedExpression.getValue(context); // work with the result // ... return "user"; } ``` For more information on SimpleEvaluationContext see: https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/expression/spel/support/SimpleEvaluationContext.html

**Why.** Reported as CWE-917. Ported from opengrep rule `gitlab.find_sec_bugs.SCRIPT_ENGINE_INJECTION-2` (generated/oss/audit.yaml).

## Examples

Bad:

```java
($PARSER $P).$METHOD($ARG);
org.springframework.expression.spel.standard.SpelExpressionParser
org.springframework.expression.ExpressionParser
```

Good:

```java
($PARSER $P).$METHOD("...");
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.SCRIPT_ENGINE_INJECTION-2` (metavariables start with `$`):

- `($PARSER $P).$METHOD($ARG);`
- `($PARSER $P).$METHOD("...");`
- `org.springframework.expression.spel.standard.SpelExpressionParser`
- `org.springframework.expression.ExpressionParser`
- `(parseExpression|parseRaw)`
