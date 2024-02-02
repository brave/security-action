# Hotwords Action

## Description

The Hotwords Action is a GitHub Action that allows you to detect specific keywords or phrases in your PR text, and take action accordingly.

## Usage

To use the Hotwords Action, you need to include it in your GitHub Actions workflow file and configure the desired hotwords.
By default the action will look for the following hotwords:

- password
- cryptography
- login
- policy
- safebrowsing
- safe browsing
- csp
- url parse
- urlparse
- :disableDigestUpdates
- pinDigest

By default this action will output the following request for actions:

```json
{
    "assigner": {
        "actions": [
            {
                "action": "ASSIGN|UNASSIGN",
                "assignees": ["#default"]
            }
        ]
    },
    "labeler": {
        "actions": [
            {
                "action": "CREATE",
                "label": "security"
            },
            {
                "action": "REMOVE",
                "label": "security"
            }
        ],
        "assignees": [
            "#default"
        ]
    },
    "commenter": {
        "actions": [
            {
                "action": "CREATE|REMOVE",
                "comment": "This is a comment ${old} ${new}"
            },
            {
                "action": "REMOVE",
                "comment": "This is a comment ${old} ${new}"
            }
        ],
        "replacements": {
            "old": "old",
            "new": "new"
        },
        "assignees": [
            "#default"
        ],
        "labels": [
            "needs-security-review"
        ],
    },
    "slack-notifier": {
        "message": "This is a message in markdown format",
        "author": "#default",
        "assignees": [
            "#default"
        ],
        "labels": [
            "needs-security-review"
        ],
    }
}
```