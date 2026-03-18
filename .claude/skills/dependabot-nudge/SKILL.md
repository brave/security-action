---
name: dependabot-nudge
description: Scan org repos for open Dependabot alerts at or above a severity threshold and build notification messages for maintainers. Use when the user wants to check or nudge about Dependabot vulnerabilities.
argument-hint: "[org]"
allowed-tools: Bash(node *)
---

# Dependabot Nudge

Scan all repositories in a GitHub organization for open Dependabot alerts and build formatted notification messages for maintainers.

## Usage

Run from the project root:

```bash
# Scan an org with default settings (high+ severity)
node run.js ./src/dependabotNudge.js --org=brave

# Custom severity threshold
node run.js ./src/dependabotNudge.js --org=brave --minlevel=critical

# Debug mode (verbose + dry-run for assignee patching)
node run.js ./src/dependabotNudge.js --org=brave --debug=true

# Skip specific repos
node run.js ./src/dependabotNudge.js --org=brave --skipRepositories=chromium,large-repo

# Single output message (joined string instead of array)
node run.js ./src/dependabotNudge.js --org=brave --singleOutputMessage=true
```

## Parameters

| Parameter              | Required | Default                | Description |
|------------------------|----------|------------------------|-------------|
| `--org`                | Yes      | -                      | GitHub organization name |
| `--githubToken`        | No       | `$GITHUB_TOKEN`        | GitHub PAT |
| `--minlevel`           | No       | `high`                 | Minimum severity: low, medium, high, critical |
| `--debug`              | No       | `false`                | Verbose logging and dry-run |
| `--skipRepositories`   | No       | `chromium`             | Comma-separated repo names to skip |
| `--skipHotwords`       | No       | DoS-related terms      | Comma-separated advisory keywords to skip |
| `--defaultContact`     | No       | `yan`                  | Comma-separated fallback GitHub usernames |
| `--singleOutputMessage`| No       | `false`                | Return a single joined string |

## Output

Returns an array of `{ repo, message }` objects (one per repo with alerts), or a single joined Markdown string if `singleOutputMessage` or `debug` is true.

## Prerequisites

- `.env` file with `GITHUB_TOKEN` (needs repo + org read permissions)
- Optionally `GH_TO_SLACK_USER_MAP` for Slack handle resolution

## Notes

- The `run.js` entry point automatically loads `.env` credentials
- Skips archived and disabled repositories automatically
- DoS-related advisories are skipped by default (configurable via `--skipHotwords`)
- Each alert is assigned to its repo's maintainers via the GitHub API
