---
name: oss/mobsf.mobsfscan.injection.command-injection.command-injection
rubric: correctness
severity: should_fix
languages: [java]
cwe: [cwe-78]
---

**Rule.** User controlled strings in exec() will result in command execution.

**Why.** Reported as cwe-78. Ported from opengrep rule `mobsf.mobsfscan.injection.command_injection.command_injection` (generated/oss/others.yaml).

## Examples

Bad:

```java
Runtime.getRuntime().exec(...);
```

Good:

```java
Runtime.getRuntime().exec("...", ...);
Runtime.getRuntime().exec(new String[] {"...", ...}, ...);
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.injection.command_injection.command_injection` (metavariables start with `$`):

- `Runtime.getRuntime().exec("...", ...);`
- `Runtime.getRuntime().exec(new String[] {"...", ...}, ...);`
- `Runtime.getRuntime().exec(...);`
