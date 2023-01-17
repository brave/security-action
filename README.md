# security-action

Composite GitHub CI Action[^1] containing the minimal viable security lint for brave repositories

## Branching Strategy

- main branch, this should be tracked and included by all the repositories, without versioning. It should be always "stable" and contain the latest and greatest security checks
- feature/*, feature branches including new security checkers
- bugfix/*, fixes for specific bugs in the action

## References

[^1]: https://docs.github.com/en/actions/creating-actions/creating-a-composite-action
