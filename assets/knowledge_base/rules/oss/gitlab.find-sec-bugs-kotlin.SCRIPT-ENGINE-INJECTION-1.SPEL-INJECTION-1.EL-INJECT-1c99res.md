---
name: oss/gitlab.find-sec-bugs-kotlin.SCRIPT-ENGINE-INJECTION-1.SPEL-INJECTION-1.EL-INJECT-1c99res
rubric: safety
severity: should_fix
languages: [kotlin]
cwe: [CWE-94]
---

**Rule.** The software constructs all or part of a code segment using externally-influenced input from an upstream component, but it does not neutralize or incorrectly neutralizes special elements that could modify the syntax or behavior of the intended code segment.

**Why.** Reported as CWE-94. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.SCRIPT_ENGINE_INJECTION-1.SPEL_INJECTION-1.EL_INJECTION-2.SEAM_LOG_INJECTION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// untrusted input (source)
$VAR
// flows to sink without sanitization
$ENGINE.eval($ARG, ...);
($ENGINE: javax.script.ScriptEngine).eval($ARG, ...);
($INVC: javax.script.Invocable).invokeFunction(..., $ARG)
($INVC: javax.script.Invocable).invokeMethod(..., $ARG)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.SCRIPT_ENGINE_INJECTION-1.SPEL_INJECTION-1.EL_INJECTION-2.SEAM_LOG_INJECTION-1` (metavariables start with `$`):

- `$ENGINE = $F.getEngineByExtension(...)
...`
- `$ENGINE.eval($ARG, ...);`
- `$ENGINE.eval("...");`
- `$ENGINE.eval("...", ($BINDING: javax.script.Bindings));`
- `($ENGINE: javax.script.ScriptEngine).eval($ARG, ...);`
- `($ENGINE: javax.script.ScriptEngine).eval("...");`
- `($ENGINE: javax.script.ScriptEngine).eval("...", ($BINDING: javax.script.Bindings));`
- `($INVC: javax.script.Invocable).invokeFunction(..., $ARG)`
- `($INVC: javax.script.Invocable).invokeMethod(..., $ARG)`
- `fun $FUNC(..., $VAR: String, ...) { ... }`
- `$VAR`
