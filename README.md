# security-action

Composite GitHub CI Action[^1] containing the minimal viable security lint for brave repositories

## Usage

Add an action under `.github/workflow/security-action.yml` with the following content:

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
          # by default assignees will be thypon and bcaller, modify accordingly
          assignees: |
            yoursecuritycontact
            yoursecondsecuritycontact
```

## Branching Strategy

- main branch, this should be tracked and included by all the repositories, without versioning. It should be always "stable" and contain the latest and greatest security checks
- feature/*, feature branches including new security checkers
- bugfix/*, fixes for specific bugs in the action

## References

[^1]: https://docs.github.com/en/actions/creating-actions/creating-a-composite-action
