# security-action

Composite GitHub CI Action[^1] containing the minimal viable security lint for
brave repositories

## Usage

Add an action under `.github/workflow/security-action.yml` with the following
content:

```yml
name: security
on:
  workflow_dispatch:
  push:
    branches: [main]
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]
    branches: [main]

jobs:
  security:
    name: security
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - uses: brave/security-action/actions/main@main
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          slack_token: ${{ secrets.HOTSPOTS_SLACK_TOKEN }} # optional
          # by default assignees will be thypon, modify accordingly
          assignees: |
            yoursecuritycontact
            yoursecondsecuritycontact
```

### Slack Threading and Completion Notifications

When a Slack token is configured, this action uses threaded messages to reduce
channel noise:

- **First run for a PR**: Creates a new thread in the Slack channel
- **Subsequent runs**: Replies are posted to the existing thread
- **Review completion**: When the `needs-security-review` label is removed by an
  assignee, a completion message is posted to the thread with a ✅ checkmark
  reaction on the parent message

To receive completion notifications when the security review label is removed,
add the `unlabeled` event type to your workflow:

```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review, unlabeled]
```

## Branching Strategy

- main branch, this should be tracked and included by all the repositories,
  without versioning. It should be always "stable" and contain the latest and
  greatest security checks
- feature/\*, feature branches including new security checkers
- bugfix/\*, fixes for specific bugs in the action

## References

[^1]:
    https://docs.github.com/en/actions/creating-actions/creating-a-composite-action
