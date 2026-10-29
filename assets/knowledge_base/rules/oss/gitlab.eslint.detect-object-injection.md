---
name: oss/gitlab.eslint.detect-object-injection
rubric: correctness
severity: should_fix
languages: [javascript, typescript]
cwe: [CWE-94]
---

**Rule.** Bracket object notation with user input is present, this might allow an attacker to access all properties of the object and even it's prototype, leading to possible code execution.

**Why.** Reported as CWE-94: Improper Control of Generation of Code ('Code Injection'). Ported from opengrep rule `gitlab.eslint.detect-object-injection` (generated/oss/others.yaml).

## Examples

Bad:

```text
$O[$ARG]
```

Good:

```text
$O["..."]
$O[($ARG : float)]
$ARG = [$V];
...
<... $O[$ARG] ...>;
$ARG = $V;
...
<... $O[$ARG] ...>;
```

## Detection hints

Literal patterns from opengrep rule `gitlab.eslint.detect-object-injection` (metavariables start with `$`):

- `$O[$ARG]`
- `$O["..."]`
- `$O[($ARG : float)]`
- `$ARG = [$V];
...
<... $O[$ARG] ...>;`
- `$ARG = $V;
...
<... $O[$ARG] ...>;`
- `(?![0-9]+)`
