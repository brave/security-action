---
name: add-maintainer-property
description: Auto-detect top maintainers for each repo in an org and set the maintainers custom property via the GitHub API. Use when the user wants to populate or update maintainer metadata.
argument-hint: "[org]"
allowed-tools: Bash(node *)
---

# Add Maintainer Custom Property

Determine top maintainers for each repository in an org and set the `maintainers` custom property.

## Usage

Run from the project root:

```bash
# Full scan (2-year commit history analysis)
node run.js ./src/addMaintainerCustomProperty.js --org=brave

# Simple scan (uses contributor list, faster)
node run.js ./src/addMaintainerCustomProperty.js --org=brave --simpleScan=true

# Debug mode (dry run)
node run.js ./src/addMaintainerCustomProperty.js --org=brave --debug=true

# Skip repos and ignore specific users
node run.js ./src/addMaintainerCustomProperty.js --org=brave --skipRepositories=chromium,fork-repo --ignoreMaintainers=bot-user,dependabot
```

## Parameters

| Parameter            | Required | Default         | Description |
|----------------------|----------|-----------------|-------------|
| `--org`              | Yes      | -               | GitHub organization name |
| `--githubToken`      | No       | `$GITHUB_TOKEN` | GitHub PAT |
| `--debug`            | No       | `false`         | Dry run with verbose logging |
| `--simpleScan`       | No       | `false`         | Use contributor list instead of commit history |
| `--skipRepositories` | No       | `chromium`      | Comma-separated repo names to skip |
| `--ignoreMaintainers`| No       | -               | Comma-separated usernames to exclude |

## Output

Returns a Markdown string listing repositories with no identifiable maintainers, or empty string if all repos have maintainers.

## Prerequisites

- `.env` file with `GITHUB_TOKEN` (needs org custom properties write + repo read permissions)

## Notes

- The `run.js` entry point automatically loads `.env` credentials
- Full scan analyzes 2 years of commit history; `simpleScan` uses the contributor list (faster but less accurate)
- This is a write operation -- it patches the `maintainers` custom property on each repo
- Use `--debug=true` first to preview changes
