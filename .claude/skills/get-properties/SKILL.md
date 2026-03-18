---
name: get-properties
description: Fetch custom properties for a GitHub repository. Use when the user wants to inspect repo metadata like runtime, maintainers, or other custom properties.
argument-hint: "[owner] [repo]"
allowed-tools: Bash(node *)
---

# Get Properties

Fetch custom properties for a GitHub repository, optionally stripping a prefix from property names.

## Usage

Run from the project root:

```bash
# Get all custom properties
node run.js ./src/getProperties.js --owner=brave --repo=brave-browser

# With prefix stripping (prefixed properties take priority)
node run.js ./src/getProperties.js --owner=brave --repo=brave-browser --prefix=sec-

# With debug logging
node run.js ./src/getProperties.js --owner=brave --repo=brave-browser --debug=true
```

## Parameters

| Parameter       | Required | Default         | Description |
|-----------------|----------|-----------------|-------------|
| `--owner`       | Yes      | -               | Repository owner |
| `--repo`        | Yes      | -               | Repository name |
| `--githubToken` | No       | `$GITHUB_TOKEN` | GitHub PAT |
| `--debug`       | No       | `false`         | Enable verbose logging |
| `--prefix`      | No       | `""`            | Property name prefix to strip (prefixed props get priority) |

## Output

Returns an object mapping property names to their values, e.g. `{ maintainers: "alice,bob", runtime: "node" }`.

## Prerequisites

- `.env` file with `GITHUB_TOKEN` (needs org custom properties read permission)

## Notes

- The `run.js` entry point automatically loads `.env` credentials
- When `--prefix` is set, a property named `sec-maintainers` becomes `maintainers` and takes priority over an unprefixed `maintainers` property
