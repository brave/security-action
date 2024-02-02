# CodeQL

Use this action to run CodeQL queries on your codebase.

This action is a simplistic way of including CodeQL in your workflow. It is not
meant to run in conjunction with other actions in this directory.

At the current stage it does not run if:

- the repository is not public
- the PR is draft
- the PR comes from a bot
- no files has been changed
- the PR is from a fork (unless `allow_fork` is set to `true`)