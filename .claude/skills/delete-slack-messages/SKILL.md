---
name: delete-slack-messages
description: Delete Slack messages from a channel filtered by bot username and repository names. Use when the user wants to bulk-delete bot messages for specific repos.
argument-hint: "[channel] [username] [repos]"
allowed-tools: Bash(node *)
---

# Delete Slack Messages

Delete Slack messages from a channel that match a specific bot username and repository filter.

## Usage

Run from the project root:

```bash
# Delete messages from a specific bot for specific repos
node run.js ./src/deleteSlackMessages.js --token=xoxb-... --channel="#secops-hotspots" --username=github-actions --repos="org/repo1,org/repo2"

# Dry run
node run.js ./src/deleteSlackMessages.js --token=xoxb-... --channel="#secops-hotspots" --username=github-actions --repos="org/repo1" --debug=true

# Custom lookback window
node run.js ./src/deleteSlackMessages.js --token=xoxb-... --channel="#secops-hotspots" --username=github-actions --repos="org/repo1" --lookbackDays=14
```

## Parameters

| Parameter        | Required | Default          | Description |
|------------------|----------|------------------|-------------|
| `--token`        | Yes      | `$SLACK_TOKEN`   | Slack bot token |
| `--channel`      | Yes      | -                | Slack channel name |
| `--username`     | Yes      | -                | Bot username to filter messages by |
| `--repos`        | No       | -                | Comma-separated repo full names (e.g. `org/repo`) |
| `--debug`        | No       | `false`          | Log what would be deleted without deleting |
| `--lookbackDays` | No       | `8`              | Number of days to look back |

## Output

Returns a number -- count of messages deleted.

## Prerequisites

- `.env` file with `SLACK_TOKEN`
- Bot must have `chat:write`, `channels:read`, `channels:history` scopes

## Notes

- The `run.js` entry point automatically loads `.env` credentials
- Use `--debug=true` first to preview what would be deleted
- This is a destructive operation -- messages cannot be recovered after deletion
