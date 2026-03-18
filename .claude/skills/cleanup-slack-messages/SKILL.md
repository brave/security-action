---
name: cleanup-slack-messages
description: Clean up stale security-action Slack messages based on review signals (reactions, label removal, resolved threads). Use when the user wants to clean old notifications from a Slack channel.
argument-hint: "[channel]"
allowed-tools: Bash(node *)
---

# Cleanup Security Action Slack Messages

Delete stale security-action messages from a Slack channel based on review completion signals.

## Usage

Run from the project root:

```bash
# Default channel (#secops-hotspots)
node run.js ./src/cleanupSecurityActionMessages.js --token=xoxb-... --githubToken=ghp_...

# Custom channel
node run.js ./src/cleanupSecurityActionMessages.js --token=xoxb-... --githubToken=ghp_... --channel="#security-alerts"

# Dry run (debug mode)
node run.js ./src/cleanupSecurityActionMessages.js --token=xoxb-... --githubToken=ghp_... --debug=true
```

## Parameters

| Parameter            | Required | Default              | Description |
|----------------------|----------|----------------------|-------------|
| `--token`            | Yes      | `$SLACK_TOKEN`       | Slack bot token |
| `--githubToken`      | Yes      | `$GITHUB_TOKEN`      | GitHub PAT for PR queries |
| `--channel`          | No       | `#secops-hotspots`   | Slack channel name |
| `--debug`            | No       | `false`              | Log what would be deleted without deleting |
| `--defaultAssignees` | No       | -                    | Comma-separated fallback GitHub usernames |

## Deletion Signals

A message is deleted if any of these signals are detected:

1. Checkmark reaction from a `/cc`'d person
2. Thumbsup from a `/cc`'d person
3. `needs-security-review` label removed by a security assignee on the linked PR
4. All `github-actions` review threads resolved by a security assignee

## Output

Returns a number -- count of messages deleted (or count that would be deleted in debug mode).

## Prerequisites

- `.env` file with `SLACK_TOKEN` and `GITHUB_TOKEN`
- Bot must have `chat:write`, `channels:read`, `channels:history`, `reactions:read` scopes

## Notes

- The `run.js` entry point automatically loads `.env` credentials
- Use `--debug=true` first to preview what would be deleted
- This is a destructive operation -- messages cannot be recovered after deletion
