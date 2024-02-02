# meta-labeler

The input for this action is a list of tuples containing the action to be made on a lable, and the label itself.

The action can be:

- CREATE
- REMOVE

The label is a string.

If multiple actions are provided for the same label, they will be resolved with the following priority:

- CREATE > REMOVE: if a single CREATE is provided, the label will be created, if it's not already present
- REMOVE: if any or more REMOVE actions are provided, the label will be removed, if it's present

IMPORTANT: If any of the assignees dismissed the label we need to create, don't readd the label.

## Example input

```json
{
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
        "yoursecuritycontact"
    ]
}
```