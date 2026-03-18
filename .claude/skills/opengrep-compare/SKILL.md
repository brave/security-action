---
name: opengrep-compare
description: Compare opengrep scan findings between current and base branch rules to detect new/removed findings. Use when the user wants to evaluate the impact of rule changes.
argument-hint: "[target-repo or local-target]"
allowed-tools: Bash(node *)
---

# Opengrep Compare

Compare opengrep scan findings between the current branch's rules and a base branch's rules to compute a delta.

## Usage

Run from the project root:

```bash
# Compare against a remote repo
node run.js ./src/opengrepCompare.js --target-repo=brave/brave-browser

# Compare against a subdirectory of a remote repo
node run.js ./src/opengrepCompare.js --target-repo=brave/brave-browser --target-path=browser/

# Compare against a local directory
node run.js ./src/opengrepCompare.js --local-target=/path/to/codebase

# Custom base branch
node run.js ./src/opengrepCompare.js --target-repo=brave/brave-browser --base-ref=develop

# Only scan changed rules
node run.js ./src/opengrepCompare.js --target-repo=brave/brave-browser --changed-rules-only=true
```

## Parameters

| Parameter             | Required | Default  | Description |
|-----------------------|----------|----------|-------------|
| `--target-repo`       | No*      | -        | GitHub repo to clone and scan (e.g. `org/repo`) |
| `--target-path`       | No       | -        | Subdirectory within the target repo to scan |
| `--local-target`      | No*      | -        | Local filesystem path to scan instead of cloning |
| `--base-ref`          | No       | `main`   | Git ref for base branch comparison |
| `--compare-rules`     | No       | `true`   | Whether to run base-branch comparison |
| `--changed-rules-only`| No       | `true`   | Only scan rule files changed between branches |

\* One of `--target-repo` or `--local-target` is required.

## Output

Returns a JSON object with:
- `total`: Total findings count
- `rules`: Number of rules scanned
- `summary`: Per-rule finding counts
- `findings`: All individual findings
- `delta`: New and removed findings vs. base branch
- `percentageIncrease`: Finding count change percentage
- `baseTotal`: Base branch findings count
- `noChanges`: Boolean indicating if no rule changes were detected

## Prerequisites

- `opengrep` CLI must be installed and on PATH
- Git access to the target repository (for cloning)

## Notes

- The `run.js` entry point automatically loads `.env` credentials
- The tool uses `git diff` to detect changed rule files between branches
- Opengrep must be pre-installed (use `installOpengrep.js` or install manually)
- This is a read-only analysis tool -- it does not modify any files
