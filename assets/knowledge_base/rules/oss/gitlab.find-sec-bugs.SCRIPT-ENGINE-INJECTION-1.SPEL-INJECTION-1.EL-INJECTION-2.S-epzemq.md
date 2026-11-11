---
name: oss/gitlab.find-sec-bugs.SCRIPT-ENGINE-INJECTION-1.SPEL-INJECTION-1.EL-INJECTION-2.S-epzemq
rubric: safety
severity: should_fix
languages: [java]
cwe: [CWE-94]
---

**Rule.** The application executes an argument using a `ScriptEngine`'s `eval` method. This may allow for direct OS commands to be executed as it's possible to pass in strings such as `java.lang.Runtime.getRuntime().exec('/bin/sh ...');`. Never pass user-supplied input directly to the `eval` function. If possible hardcode all JavasScript code or use a lookup table to resolve user input to known values. If none of these techniques are possible, use `javax.script.Bindings` to pass input to the script engine. Example using `Binding` to safely pass in string values: ``` // Get ECMAScript engine ScriptEngine engine = new ScriptEngineManager().getEngineByName("ECMAScript"); // User input, consisting of first and last name String userFirstName = "John"; String userLastName = "Snow"; // Create bindings to pass into our script, forcing the values to be String. Bindings bindings = engine.createBindings(); bindings.put("fname", new String(userFirstName)); bindings.put("lname", new String(userLastName)); // Example script that concatenates a greeting with the user-supplied input first/last name String script = "var greeting='Hello ';" + // fname and lname variables will be resolved by our bindings defined above "greeting += fname + ' ' + lname;" + // prints greeting "greeting"; try { // Execute the script, passing in the bindings Object bindingsResult = engine.eval(script, bindings); // Work with result // ... } catch (ScriptException e) { // Handle exception e.printStackTrace(); } ```

**Why.** Reported as CWE-94. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs.SCRIPT_ENGINE_INJECTION-1.SPEL_INJECTION-1.EL_INJECTION-2.SEAM_LOG_INJECTION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// untrusted input (source)
$VAR
// flows to sink without sanitization
(javax.script.ScriptEngine $ENGINE).eval($ARG, ...);
(javax.script.Invocable $INVC).invokeFunction(..., $ARG)
(javax.script.Invocable $INVC).invokeMethod(..., $ARG)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.SCRIPT_ENGINE_INJECTION-1.SPEL_INJECTION-1.EL_INJECTION-2.SEAM_LOG_INJECTION-1` (metavariables start with `$`):

- `(javax.script.ScriptEngine $ENGINE).eval($ARG, ...);`
- `(javax.script.ScriptEngine $ENGINE).eval("...");`
- `(javax.script.ScriptEngine $ENGINE).eval("...", (javax.script.Bindings $BINDING));`
- `(javax.script.Invocable $INVC).invokeFunction(..., $ARG)`
- `(javax.script.Invocable $INVC).invokeMethod(..., $ARG)`
- `$FUNC(..., $VAR, ...) { ... }`
- `$VAR`
