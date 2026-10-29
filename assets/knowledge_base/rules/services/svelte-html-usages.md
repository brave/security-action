---
name: services/svelte-html-usages
rubric: safety
severity: nit
languages: [generic]
---

**Rule.** The code contains new security hotspots (`{@html expression}`) which should be checked manually by a security team member!

**Why.** Reported as CWE-79: Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting'). See https://cwe.mitre.org/data/definitions/546. See https://cwe.mitre.org/data/definitions/615. See https://btlr.dev/blog/how-to-find-vulnerabilities-in-code-bad-words. Ported from opengrep rule `svelte-html-usages` (services/svelte-html-usages.yaml).

## Examples

Bad:

```text
\{@html\s+[^A-Z]
```

Good:

```text
\{@html\s+safeTranslate\(
\{@html\s+sanitize\(
\{@html\s+serializeJsonLD\(
```

## Detection hints

Literal patterns from opengrep rule `svelte-html-usages` (metavariables start with `$`):

- `\{@html\s+[^A-Z]`
- `\{@html\s+safeTranslate\(`
- `\{@html\s+sanitize\(`
- `\{@html\s+serializeJsonLD\(`
