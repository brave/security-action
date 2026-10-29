---
name: oss/gitlab.find-sec-bugs-kotlin.COMMAND-INJECTION-1
rubric: safety
severity: should_fix
languages: [kotlin]
cwe: [CWE-78]
---

**Rule.** The highlighted API is used to execute a system command. If unfiltered input is passed to this API, it can lead to arbitrary command execution.

**Why.** Reported as CWE-78. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.COMMAND_INJECTION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.COMMAND_INJECTION-1` (metavariables start with `$`):

- `fun $FUNC(..., $PARAM: String, ...) {
  ...
}`
- `$R = Runtime.getRuntime()
...`
- `$R.exec(<...$PARAM...>,...)`
- `$CMDARR = arrayOf("$SHELL",...,<...$PARAM...>,...)
...
$R.exec($CMDARR,...)`
- `$R.exec(arrayOf("$SHELL",...,<...$PARAM...>,...), ...)`
- `$R.exec(java.util.String.format("...", ...,<...$PARAM...>,...))`
- `$R.exec(($A: String) + ($B: String))`
- `(/.../)?(sh|bash|ksh|csh|tcsh|zsh)$`
- `$R.exec("...","...","...",...)`
- `$R.exec(arrayOf("...","...","...",...),...)`
- `$PB = ProcessBuilder()
...`
- `$PB.command(<...$PARAM...>,...)`
- `$VAL = <...$PARAM...>; ...`
- `$PB.command(<...$VAL...>,...)`
- `$PB.command("$SHELL",...,<...$PARAM...>,...)`
- `$CMDARR = java.util.Arrays.asList("$SHELL",...,<...$PARAM...>,...)
...
$PB.command($CMDARR,...)`
- `$PB.command(java.util.Arrays.asList("$SHELL",...,<...$PARAM...>,...),...)`
- `$PB.command(java.util.String.format("...", ...,<...$PARAM...>,...))`
- `$PB.command(($A: String) + ($B: String))`
- `$PB.command("...","...","...",...)`
- `$PB.command(java.util.Arrays.asList("...","...","...",...))`
