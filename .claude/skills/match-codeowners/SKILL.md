---
name: match-codeowners
description: Match a list of changed file paths against a CODEOWNERS file to determine code ownership. Use when the user wants to find who owns specific files or directories.
argument-hint: "[file-paths]"
allowed-tools: Bash(node *)
---

# Match CODEOWNERS

Match changed file paths against a CODEOWNERS file to determine ownership (teams and individuals).

## Usage

Run from the project root:

```bash
# Match specific files
node run.js ./src/matchCodeowners.js --changedFiles="src/foo.js,src/bar.js"

# With explicit CODEOWNERS path
node run.js ./src/matchCodeowners.js --changedFiles="src/foo.js" --codeownersPath=./CODEOWNERS

# With debug logging
node run.js ./src/matchCodeowners.js --changedFiles="src/foo.js,src/bar.js" --debug=true
```

## Parameters

| Parameter          | Required | Default       | Description |
|--------------------|----------|---------------|-------------|
| `--changedFiles`   | Yes      | -             | Comma-separated list of file paths |
| `--codeownersPath` | No       | Auto-detected | Explicit path to CODEOWNERS file |
| `--basePath`       | No       | `.`           | Base directory for CODEOWNERS search |
| `--debug`          | No       | `false`       | Enable verbose logging |

## Output

Returns a JSON object with:
- `ownersToFiles`: Map of owner -> array of matched file paths
- `filesWithoutOwners`: Array of files with no matching CODEOWNERS rule
- `stats`: Summary with `totalFiles`, `filesWithOwners`, `filesWithoutOwners`, `uniqueOwners`, `teams`, `individuals`, `teamsList`, `individualsList`

## Prerequisites

- A CODEOWNERS file in the repository (searched in `.github/CODEOWNERS`, `CODEOWNERS`, or `docs/CODEOWNERS`)

## Notes

- The `run.js` entry point automatically loads `.env` credentials
- CODEOWNERS patterns use gitignore-style glob matching
- Both teams (`@org/team`) and individuals (`@user`) are supported
- Files are matched against patterns in order; later rules take precedence
