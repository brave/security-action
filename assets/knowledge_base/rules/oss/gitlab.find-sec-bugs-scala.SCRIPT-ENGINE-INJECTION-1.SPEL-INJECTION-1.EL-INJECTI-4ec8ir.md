---
name: oss/gitlab.find-sec-bugs-scala.SCRIPT-ENGINE-INJECTION-1.SPEL-INJECTION-1.EL-INJECTI-4ec8ir
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-94]
---

**Rule.** The software constructs all or part of a code segment using externally-influenced input from an upstream component, but it does not neutralize or incorrectly neutralizes special elements that could modify the syntax or behavior of the intended code segment.

**Why.** Reported as CWE-94. Ported from opengrep rule `gitlab.find_sec_bugs_scala.SCRIPT_ENGINE_INJECTION-1.SPEL_INJECTION-1.EL_INJECTION-2.SEAM_LOG_INJECTION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
($ENGINE: javax.script.ScriptEngine).eval($ARG)
```

Good:

```text
($ENGINE: javax.script.ScriptEngine).eval("...")
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.SCRIPT_ENGINE_INJECTION-1.SPEL_INJECTION-1.EL_INJECTION-2.SEAM_LOG_INJECTION-1` (metavariables start with `$`):

- `($ENGINE: javax.script.ScriptEngine).eval($ARG)`
- `($ENGINE: javax.script.ScriptEngine).eval("...")`
