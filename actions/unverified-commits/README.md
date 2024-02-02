# unverified-commits

This action checks if there are unverified commits in the current branch.

## Usage

By default the action will output the following request for actions:

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
                "action": "CREATE|REMOVE",
                "label": "unverified-commits"
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
            "unverified-commits"
        ],
    },
    "slack-notifier": {
        "message": "This is a message in markdown format",
        "author": "#default",
        "assignees": [
            "#default"
        ],
        "labels": [
            "unverified-commits"
        ],
    }
}
```