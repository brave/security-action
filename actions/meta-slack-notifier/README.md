# meta-slack-notifier

The input for this action is a message in markdown format, and an optional author and assignees list.

In case a similar message has been already posted in the last N messages, the action won't repost again.

If available, the action uses a gh to slack map to identify the correct slack contact for the given github user.

IMPORTANT: If any of the assignees dismissed an indicated label, don't resend a slack message.

## Example input

```json
{
    "message": "This is a message in markdown format",
    "author": "yourauthorcontact",
    "assignees": [
        "yoursecuritycontact"
    ],
    "labels": [
        "needs-security-review"
    ],
}
```