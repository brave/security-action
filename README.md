# security-action

Composite GitHub CI Action[^1] containing the minimal viable security lint for brave repositories

## Usage

Add an action under `.github/workflow/security-action.yml` with the following content:

```yml
name: security
on:
  workflow_dispatch:
  push:
    branches: [main]
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]
    branches: [main]

jobs:
  security:
    name: security
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - uses: brave/security-action/actions/main@main
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          slack_token: ${{ secrets.HOTSPOTS_SLACK_TOKEN }} # optional
          # by default assignees will be thypon, modify accordingly
          assignees: |
            yoursecuritycontact
            yoursecondsecuritycontact
```

## Branching Strategy

- main branch, this should be tracked and included by all the repositories, without versioning. It should be always "stable" and contain the latest and greatest security checks
- feature/*, feature branches including new security checkers
- bugfix/*, fixes for specific bugs in the action

## Sandbox Threat Model

PR-controlled dependency manifests (`requirements*.txt`, `pyproject.toml`/`uv.lock`, `package.json`/`pnpm-lock.yaml`) make this action execute **attacker-chosen install scripts** (pip sdist build hooks, PEP 517 backends, pnpm/git lifecycle hooks). To limit the blast radius, every installer and scanner runs inside a [Landlock](https://docs.kernel.org/userspace-api/landlock.html) sandbox via [landrun](https://github.com/Zouuup/landrun) (pinned binary, SHA256-verified, installed by `src/installLandrun.js`, wrapped by `scripts/with-sandbox.sh`).

| Surface | Filesystem | Egress |
|---|---|---|
| pip-audit (`pip install` of PR requirements) | workspace read-only; venv in private temp | TLS 443 |
| uv sync (PR `uv.lock`) | action tree read-only; `.venv` + uv caches writable | TLS 443 |
| pnpm install (PR lockfile) | project read-only; `node_modules` + pnpm caches writable | TLS 443 |
| opengrep / sveltegrep / safesvg / modelscan | workspace read-only; writes to private temp mirrors | **none** |
| npm-audit (lockfile audit POST) | workspace read-only; private temp writable | TLS 443 |
| opengrep-compare (clone/worktree/git) | action tree read-only; clone + worktree temp writable | TLS 443 for clone/fetch only |

The wrapper **fails closed in CI**: when `CI=true` and landrun is missing (or the kernel lacks the `landlock` LSM), commands abort instead of running unsandboxed. On dev machines it degrades with a warning. The wrapper also passes only an allowlist of environment variables to sandboxed children (`SANDBOX_ENV_EXTRA` extends it), so secrets like the reviewdog token do not reach PR-executed code. `.github/workflows/sandbox-hardening.yml` runs honeypot probes on every sandbox change (`.env`/`~/.ssh` reads denied, network denied without grants, TLS 443 reachable when granted, missing-landrun fail-closed).

**Residual risks** (documented, not solved by Landlock):

- Landlock filters **ports, not hosts** — any tool with `--connect-tcp 443` can still talk to an attacker-chosen TLS host (e.g. exfiltrate to `evil.com:443`). Host-level pinning needs a proxy or egress firewall.
- `landrun`'s `--env` allowlist passes **values** from the wrapper's environment; extra env vars must be opted in via `SANDBOX_ENV_EXTRA`, but anything on the list is visible to the child.
- A repo-root `.env` (gitignored, dev machines only) is inside the read-only workspace mount and readable by sandboxed children — CI runners never have one, but do not keep real tokens in a local `.env` while testing PRs.
- Landlock inherits into child processes but does not defend against a kernel exploit, and scanner-level memory corruption (parsing untrusted files) stays possible within the granted reads.

## References

[^1]: https://docs.github.com/en/actions/creating-actions/creating-a-composite-action
