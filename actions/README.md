# Actions Directory

This directory contains componentized actions that can be used singularly or in combination to create a workflow.

All the actions get something in input, and (some) produce something in output.
This output can be tested to verify the action is working as expected.

The actions starting with `meta-` are meant to be used as collectors of other actions, and they are not meant to be used directly.

Every action should have a README.md file describing its usage and testing.

If a given action can be connected to another `meta-<action_name>.yml` action, it should contain an output named `<action_name>_output` that can be used as input for the `meta-<action_name>.yml` action.

## Testing

To test an action, you should create a workflow in the repository `./.github/workflows/` directory, and run it.
By convension, the workflow should be named `<...>-test.yml` and test a single action.
Multiple tests can be created for the same action.