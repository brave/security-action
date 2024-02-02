# meta-assigner

The input for this action is a list of tuples containing the action to be made on a assignee, and the assignee itself.

The action can be:

- ASSIGN
- UNASSIGN

The assignee is a string.

If multiple actions are provided for the same assignee, they will be resolved with the following priority:

- ASSIGN > UNASSIGN: if a single ASSIGN is provided, the assignee will be assigned, if it's not already assigned
- UNASSIGN: if any or more UNASSIGN actions are provided, the assignee will be unassigned, if it's assigned

## Example input

```json
{
    "actions": [
        {
            "action": "ASSIGN",
            "assignees": ["yoursecuritycontact"]
        },
        {
            "action": "UNASSIGN",
            "assignee": ["yoursecuritycontact"]
        }
    ]
}
```