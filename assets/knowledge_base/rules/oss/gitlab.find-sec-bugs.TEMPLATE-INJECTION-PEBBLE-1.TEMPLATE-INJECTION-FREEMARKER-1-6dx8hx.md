---
name: oss/gitlab.find-sec-bugs.TEMPLATE-INJECTION-PEBBLE-1.TEMPLATE-INJECTION-FREEMARKER-1-6dx8hx
rubric: safety
severity: should_fix
languages: [java]
cwe: [CWE-94]
---

**Rule.** The application may allow control over a template string. Providing user input directly in the template by dynamically creating template strings may allow an adversary to execute arbitrary Java code, including OS system commands. For Velocity, never call `evaluate` with user-supplied input in the template string. Use a `VelocityContext` object instead to data-bind user-supplied information as it will be treated as an underlying data type and not template code. Example using Apache Velocity's `VelocityContext` and escape tools to pass in user-supplied data to a template: ``` // Create a tool manager ToolManager manager = new ToolManager(true); // Create a context from the tool manager Context context = manager.createContext(); // For demonstration purposes, alternatively configure from a properties file context.put("esc", new EscapeTool()); // For demonstration purposes, create an output buffer StringWriter stringWriter = new StringWriter(); // Get userInput String userInput = "potentially malicious data"; // Use the context to pass in the userInput value context.put("userInput", userInput); // Pass in the context, the output buffer, a logtag (demo), and the template with userInput // making sure to escape it if in the context of HTML. Velocity.evaluate(context, stringWriter, "demo", "Hello $esc.html($userInput)"); // Work with the output buffer // ... ``` For other templating engines, please see your framework's documentation.

**Why.** Reported as CWE-94. Ported from opengrep rule `gitlab.find_sec_bugs.TEMPLATE_INJECTION_PEBBLE-1.TEMPLATE_INJECTION_FREEMARKER-1.TEMPLATE_INJECTION_VELOCITY-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.TEMPLATE_INJECTION_PEBBLE-1.TEMPLATE_INJECTION_FREEMARKER-1.TEMPLATE_INJECTION_VELOCITY-1` (metavariables start with `$`):

- `org.apache.velocity.app.Velocity.evaluate(..., $VAR)`
- `org.apache.velocity.app.Velocity.evaluate(..., "...")`
- `$C = (freemarker.template.Configuration $CFG).getTemplate("...");
...`
- `$C = (freemarker.template.Configuration $CFG).getTemplate($IN);
...`
- `$C.process(...)`
- `import com.mitchellbosecke.pebble.PebbleEngine;
...`
- `$C = $T.getTemplate($IN);
...`
- `$C = $T.getTemplate("...");
...`
- `$C.evaluate(...)`
