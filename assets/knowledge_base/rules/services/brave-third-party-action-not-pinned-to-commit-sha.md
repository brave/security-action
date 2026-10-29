---
name: services/brave-third-party-action-not-pinned-to-commit-sha
rubric: safety
severity: should_fix
languages: [yaml]
---

**Rule.** An action sourced from a third-party repository on GitHub is not pinned to a full length commit SHA or is missing the semver reference comment You can use pinact - https://github.com/suzuki-shunsuke/pinact - to pin them 👍 `uses: actions/cache@88522ab9f39a2ea568f7027eddc7d8d8bc9d59c8 # v3.3.1` 👎 `uses: actions/cache@v3` `uses: actions/cache@v3.3.1` [GHA Policies](https://github.com/brave/internal/wiki/Pull-request-security-audit-checklist)

**Why.** Reported as CWE-1357: Reliance on Insufficiently Trustworthy Component. See https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components. See https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions#using-third-party-actions. Ported from opengrep rule `brave-third-party-action-not-pinned-to-commit-sha` (services/brave-third-party-action-not-pinned-to-commit-sha.yaml).

## Examples

Bad:

```text
\buses:\s+(?<USES>.*)\s*$
```

Good:

```text
^[.]/
^brave/
^brave-intl/
^brave-experiments/
@[0-9a-f]{40}\s+#\s+v?\d+\.\d+\.\d+$
^docker://.*@sha256:[0-9a-f]{64}\s+#\s+v?\d+\.\d+\.\d+$
```

## Detection hints

Literal patterns from opengrep rule `brave-third-party-action-not-pinned-to-commit-sha` (metavariables start with `$`):

- `\buses:\s+(?<USES>.*)\s*$`
- `^[.]/`
- `^brave/`
- `^brave-intl/`
- `^brave-experiments/`
- `@[0-9a-f]{40}\s+#\s+v?\d+\.\d+\.\d+$`
- `^docker://.*@sha256:[0-9a-f]{64}\s+#\s+v?\d+\.\d+\.\d+$`
