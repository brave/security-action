# meta-commenter

The input for this action is a list of tuples containing the action to be made on a comment, and the comment itself.

The action can be:

- CREATE
- REMOVE

The comment is a string.

If multiple actions are provided for the same comment, they will be resolved with the following priority:

- CREATE > REMOVE: if a single CREATE is provided, the comment will be created, if it's not already present
- REMOVE: if any or more REMOVE actions are provided, the comment will be removed, if it's present

IMPORTANT: If any of the assignees dismissed an indicated label, don't readd the comment.

If any of the comment template matches the comment, don't readd the comment, and update the existing one.

## Example input

```json
{
    "actions": [
        {
            "action": "CREATE",
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
        "yoursecuritycontact"
    ],
    "labels": [
        "needs-security-review"
    ],
}
```