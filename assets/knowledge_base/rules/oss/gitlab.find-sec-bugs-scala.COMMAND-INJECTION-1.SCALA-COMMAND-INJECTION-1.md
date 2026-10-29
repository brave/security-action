---
name: oss/gitlab.find-sec-bugs-scala.COMMAND-INJECTION-1.SCALA-COMMAND-INJECTION-1
rubric: safety
severity: should_fix
languages: [scala]
---

**Rule.** The highlighted API is used to execute a system command. If unfiltered input is passed to this API, it can lead to arbitrary command execution.

**Why.** Reported as CWE-78. Ported from opengrep rule `gitlab.find_sec_bugs_scala.COMMAND_INJECTION-1.SCALA_COMMAND_INJECTION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.COMMAND_INJECTION-1.SCALA_COMMAND_INJECTION-1` (metavariables start with `$`):

- `def $FUNC(..., $PARAM: String, ...): $TYPE = {
  ...
}`
- `val $RT = Runtime.getRuntime
...`
- `$RT.exec($PARAM)`
- `var $CMDARR = new Array[String]("$SHELL",...,$PARAM,...)
...
$RT.exec($CMDARR,...)`
- `$RT.exec(Array[String]("$SHELL",...,$PARAM,...), ...)`
- `$RT.exec(java.util.String.format("...", ...,$PARAM,...))`
- `$RT.exec(($A: String) + ($B: String))`
- `(/.../)?(sh|bash|ksh|csh|tcsh|zsh)$`
- `$RT.exec("...","...","...",...)`
- `$RT.exec(new Array[String]("...","...","...",...),...)`
- `def $FUNC(...,$PARAM: String, ...): $TYPE = {
  ...
}`
- `val $PB = new ProcessBuilder()
...`
- `$PB.command($PARAM,...)`
- `$PB.command("$SHELL",...,$PARAM,...)`
- `var $CMDARR = java.util.Arrays.asList("$SHELL",...,$PARAM,...)
...
$PB.command($CMDARR,...)`
- `$PB.command(java.util.Arrays.asList("$SHELL",...,$PARAM,...),...)`
- `$PB.command(java.util.String.format("...", ...,$PARAM,...))`
- `$PB.command(($A: String) + ($B: String))`
- `$PB.command("...","...","...",...)`
- `$PB.command(java.util.Arrays.asList("...","...","...",...))`
