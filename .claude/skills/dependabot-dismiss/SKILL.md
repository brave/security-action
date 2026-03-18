---
name: dependabot-dismiss
description: Auto-dismiss Dependabot alerts matching configurable hotwords (e.g. DoS) or a GHSA/CVE dismiss list. Use when the user wants to bulk-dismiss low-priority Dependabot alerts.
argument-hint: "[org]"
allowed-tools: Bash(node *)
---

# Dependabot Auto-Dismiss

Fetch open Dependabot alerts across an org and auto-dismiss those matching hotwords or a dismiss list file.

## Usage

Run from the project root:

```bash
# Dismiss DoS-related alerts in an org
node run.js ./src/dependabotDismiss.js --org=brave

# Dry run (debug mode)
node run.js ./src/dependabotDismiss.js --org=brave --debug=true

# Custom severity threshold
node run.js ./src/dependabotDismiss.js --org=brave --minlevel=medium

# Custom dismiss list file
node run.js ./src/dependabotDismiss.js --org=brave --dependabotDismissConfig=./my-dismiss-list.txt
```

## Parameters

| Parameter                  | Required | Default                  | Description |
|----------------------------|----------|--------------------------|-------------|
| `--org`                    | Yes      | -                        | GitHub organization name |
| `--githubToken`            | No       | `$GITHUB_TOKEN`          | GitHub PAT |
| `--minlevel`               | No       | `low`                    | Minimum severity: low, medium, high, critical |
| `--debug`                  | No       | `false`                  | Log dismiss actions without actually dismissing |
| `--hotwords`               | No       | DoS-related terms        | Comma-separated summary keywords to match |
| `--actor`                  | No       | `security-action`        | Name used in dismiss comment |
| `--dependabotDismissConfig`| No       | `dependabot-dismiss.txt` | Path to file with GHSA/CVE IDs to dismiss |

## Output

Returns `{ message, dismissedRepos }` -- a Markdown summary of dismissed alerts and an array of affected repo full names.

## Prerequisites

- `.env` file with `GITHUB_TOKEN` (needs Dependabot alerts read + dismiss permissions)

## Notes

- The `run.js` entry point automatically loads `.env` credentials
- Use `--debug=true` first to preview what would be dismissed
- Alerts are dismissed with a "not_used" reason and a comment identifying the actor
- This is a write operation -- alerts will be permanently dismissed
