---
name: renovate-sanity-check
description: Check all repos in a GitHub org for Renovate config compliance (must extend the shared org config). Use when the user wants to audit Renovate adoption.
argument-hint: "[org]"
allowed-tools: Bash(node *)
---

# Renovate Sanity Check

Check all non-archived, non-fork repositories in a GitHub organization for Renovate configuration compliance.

## Usage

Run from the project root:

```bash
# Check an org
node run.js ./src/renovateSanityCheck.js --org=brave

# Debug mode
node run.js ./src/renovateSanityCheck.js --org=brave --debug=true

# Skip specific repos
node run.js ./src/renovateSanityCheck.js --org=brave --skipRepositories=chromium,renovate-config
```

## Parameters

| Parameter            | Required | Default                     | Description |
|----------------------|----------|-----------------------------|-------------|
| `--org`              | Yes      | -                           | GitHub organization name |
| `--githubToken`      | No       | `$GITHUB_TOKEN`             | GitHub PAT |
| `--debug`            | No       | `false`                     | Enable verbose logging |
| `--skipRepositories` | No       | `chromium,renovate-config`  | Comma-separated repo names to skip |

## Output

Returns a Markdown string listing:
- Repos without any Renovate config
- Repos that have a Renovate config but don't extend the shared org config (`local>ORG/renovate-config`)

Returns `undefined` if all repos are compliant.

## Prerequisites

- `.env` file with `GITHUB_TOKEN` (needs repo read permissions)

## Notes

- The `run.js` entry point automatically loads `.env` credentials
- Checks for Renovate config in `renovate.json`, `.github/renovate.json`, `renovate.json5`, and `package.json` (renovate key)
- A compliant config must extend `local>ORG/renovate-config`
