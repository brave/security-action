---
name: oss/mobsf.mobsfscan.injection.command-injection-formated.command-injection-warning
rubric: correctness
severity: should_fix
languages: [java]
cwe: [cwe-78]
---

**Rule.** A formatted or concatenated string was detected as input to a java.lang.Runtime call. This is dangerous if a variable is controlled by user input and could result in a command injection. Ensure your variables are not controlled by users or sufficiently sanitized.

**Why.** Reported as cwe-78. Ported from opengrep rule `mobsf.mobsfscan.injection.command_injection_formated.command_injection_warning` (generated/oss/others.yaml).

## Examples

Bad:

```java
$RUNTIME.exec($X + $Y);
$RUNTIME.exec(String.format(...));
$RUNTIME.loadLibrary($X + $Y);
$RUNTIME.loadLibrary(String.format(...));
$RUNTIME.exec("=~/(sh|bash|ksh|csh|tcsh|zsh)/","-c",$ARG,...)
$RUNTIME.exec(Arrays.asList("=~/(sh|bash|ksh|csh|tcsh|zsh)/","-c",$ARG,...),...)
$RUNTIME.exec(new String[]{"=~/(sh|bash|ksh|csh|tcsh|zsh)/","-c",$ARG,...},...)
$RUNTIME.exec($CMD,"-c",$ARG,...)
$RUNTIME.exec(Arrays.asList($CMD,"-c",$ARG,...),...)
$RUNTIME.exec(new String[]{$CMD,"-c",$ARG,...},...)
```

Good:

```java
$ARG = "...";
...
$RUNTIME.exec("...","...","...",...)
$RUNTIME.exec(new String[]{"...","...","...",...},...)
$RUNTIME.exec(Arrays.asList("...","...","...",...),...)
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.injection.command_injection_formated.command_injection_warning` (metavariables start with `$`):

- `$RUNTIME.exec($X + $Y);`
- `$RUNTIME.exec(String.format(...));`
- `$RUNTIME.loadLibrary($X + $Y);`
- `$RUNTIME.loadLibrary(String.format(...));`
- `$RUNTIME.exec("=~/(sh|bash|ksh|csh|tcsh|zsh)/","-c",$ARG,...)`
- `$RUNTIME.exec(Arrays.asList("=~/(sh|bash|ksh|csh|tcsh|zsh)/","-c",$ARG,...),...)`
- `$RUNTIME.exec(new String[]{"=~/(sh|bash|ksh|csh|tcsh|zsh)/","-c",$ARG,...},...)`
- `$RUNTIME.exec($CMD,"-c",$ARG,...)`
- `$RUNTIME.exec(Arrays.asList($CMD,"-c",$ARG,...),...)`
- `$RUNTIME.exec(new String[]{$CMD,"-c",$ARG,...},...)`
- `$CMD = "=~/(sh|bash|ksh|csh|tcsh|zsh)/";
...`
- `$ARG = "...";
...`
- `$RUNTIME.exec("...","...","...",...)`
- `$RUNTIME.exec(new String[]{"...","...","...",...},...)`
- `$RUNTIME.exec(Arrays.asList("...","...","...",...),...)`
- `$TYPE $RUNTIME = Runtime.getRuntime(...);
...`
