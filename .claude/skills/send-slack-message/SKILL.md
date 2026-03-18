---
name: send-slack-message
description: Send a message to a Slack channel with markdown support, colored attachments, and deduplication. Use when the user wants to post notifications or alerts to Slack.
argument-hint: "[channel] [message-text]"
allowed-tools: Bash(node *)
---

# Send Slack Message

Send a markdown or plain-text message to a Slack channel.

## Usage

Run from the project root:

```bash
# Simple text message
node run.js ./src/sendSlackMessage.js --channel="#secops-hotspots" --text="Hello world"

# Markdown body message
node run.js ./src/sendSlackMessage.js --channel="#secops-hotspots" --message="**Bold** message"

# With color (named or hex)
node run.js ./src/sendSlackMessage.js --channel="#secops-hotspots" --message="Alert!" --color=red

# With custom bot username
node run.js ./src/sendSlackMessage.js --channel="#secops-hotspots" --text="Hello" --username=security-bot
```

## Parameters

| Parameter    | Required | Default            | Description |
|--------------|----------|--------------------|-------------|
| `--token`    | No       | `$SLACK_TOKEN`     | Slack bot token (xoxb-...). Falls back to env var |
| `--channel`  | Yes      | -                  | Slack channel name (e.g. `#secops-hotspots`) |
| `--text`     | No*      | -                  | Plain text / mrkdwn summary line |
| `--message`  | No*      | -                  | Markdown body (converted to Slack Block Kit) |
| `--color`    | No       | -                  | Named color (red, green, yellow, blue, cyan, magenta, black, white) or hex (#FF5733) |
| `--username` | No       | `github-actions`   | Bot display name |
| `--debug`    | No       | `false`            | Enable debug logging |

\* At least one of `--text` or `--message` is required. Both can be provided.

## Output

Returns the Slack API response JSON including `ok` status, message timestamp (`ts`), and channel ID.

## Prerequisites

- `.env` file with `SLACK_TOKEN` (bot token with `chat:write`, `channels:read`, `channels:history` scopes)
- The bot must be invited to the target channel

## Notes

- The `run.js` entry point automatically loads `.env` credentials
- Markdown is converted to Slack Block Kit format via `@tryfabric/mack`
- Messages are deduplicated: the same (text + message + color) combination won't be posted twice within 24 hours
- Slack blocks are capped at 50 (Slack API limit); longer messages are truncated
- This is a write operation -- confirm with the user before sending if the message wasn't explicitly provided
