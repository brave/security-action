# reviewdog

This action runs reviewdog over the changed files in a pull request.

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