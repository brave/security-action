---
name: get-maintainers
description: List all repositories in a GitHub org with their maintainers custom property. Use when the user wants to see who maintains each repo.
argument-hint: "[org]"
allowed-tools: Bash(node *)
---

# Get Maintainers

List all repositories in a GitHub organization along with their `maintainers` custom property value.

## Usage

Run from the project root:

```bash
# List maintainers for all repos in an org
node run.js ./src/getMaintainers.js --org=brave

# With explicit token
node run.js ./src/getMaintainers.js --org=brave --githubToken=ghp_...
```

## Parameters

| Parameter       | Required | Default         | Description |
|-----------------|----------|-----------------|-------------|
| `--org`         | Yes      | -               | GitHub organization name |
| `--githubToken` | No       | `$GITHUB_TOKEN` | GitHub PAT |

## Output

Returns a Markdown-formatted string with one line per repo that has maintainers:
```
- https://github.com/org/repo maintainers: user1, user2
```

## Prerequisites

- `.env` file with `GITHUB_TOKEN` (needs org custom properties read + repo metadata permissions)

## Notes

- The `run.js` entry point automatically loads `.env` credentials
- Only repos with a non-empty `maintainers` property are listed
