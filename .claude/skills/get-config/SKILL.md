---
name: get-config
description: Fetch and parse a JSON config file from a GitHub repository. Use when the user wants to read a configuration file from a remote repo.
argument-hint: "[owner] [repo] [path]"
allowed-tools: Bash(node *)
---

# Get Config

Fetch and JSON-parse a configuration file from a GitHub repository via the contents API.

## Usage

Run from the project root:

```bash
# Fetch a config file
node run.js ./src/getConfig.js --owner=brave --repo=brave-browser --path=.github/security-action.json

# With debug logging
node run.js ./src/getConfig.js --owner=brave --repo=brave-browser --path=.github/security-action.json --debug=true
```

## Parameters

| Parameter       | Required | Default         | Description |
|-----------------|----------|-----------------|-------------|
| `--owner`       | Yes      | -               | Repository owner |
| `--repo`        | Yes      | -               | Repository name |
| `--path`        | Yes      | -               | File path within the repo |
| `--githubToken` | No       | `$GITHUB_TOKEN` | GitHub PAT |
| `--debug`       | No       | `false`         | Enable verbose logging |

## Output

Returns the parsed JSON object from the file, or `{}` on error (file not found, invalid JSON, etc.).

## Prerequisites

- `.env` file with `GITHUB_TOKEN`

## Notes

- The `run.js` entry point automatically loads `.env` credentials
- Returns an empty object if the file doesn't exist or can't be parsed
- Commonly used to fetch `.github/security-action.json` per-repo configuration
