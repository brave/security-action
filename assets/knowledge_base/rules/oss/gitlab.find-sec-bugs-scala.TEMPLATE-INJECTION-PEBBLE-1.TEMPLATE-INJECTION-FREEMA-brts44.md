---
name: oss/gitlab.find-sec-bugs-scala.TEMPLATE-INJECTION-PEBBLE-1.TEMPLATE-INJECTION-FREEMA-brts44
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-94]
---

**Rule.** A malicious user in control of a template can run malicious code on the server-side. Velocity templates should be seen as scripts.

**Why.** Reported as CWE-94. Ported from opengrep rule `gitlab.find_sec_bugs_scala.TEMPLATE_INJECTION_PEBBLE-1.TEMPLATE_INJECTION_FREEMARKER-1.TEMPLATE_INJECTION_VELOCITY-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.TEMPLATE_INJECTION_PEBBLE-1.TEMPLATE_INJECTION_FREEMARKER-1.TEMPLATE_INJECTION_VELOCITY-1` (metavariables start with `$`):

- `org.apache.velocity.app.Velocity.evaluate(..., $VAR)`
- `org.apache.velocity.app.Velocity.evaluate(..., "...")`
- `$C = ($CFG: freemarker.template.Configuration).getTemplate("...");
...`
- `$C = ($CFG: freemarker.template.Configuration).getTemplate($IN);
...`
- `$C.process(...)`
- `import com.mitchellbosecke.pebble.PebbleEngine;
...`
- `$C = $T.getTemplate($IN);
...`
- `$C = $T.getTemplate("...");
...`
- `$C.evaluate(...)`
