---
name: check-rule-metadata
description: Validate metadata fields (author, source, category) in opengrep/semgrep YAML rule files. Use when the user wants to lint or check rule quality.
argument-hint: "[dirs]"
allowed-tools: Bash(node *)
---

# Check Rule Metadata

Validate metadata fields in opengrep/semgrep YAML rule files to ensure compliance with project standards.

## Usage

Run from the project root:

```bash
# Default directories (assets/opengrep_rules/services + client)
node run.js ./src/checkRuleMetadata.js

# Custom directories
node run.js ./src/checkRuleMetadata.js --dirs="assets/opengrep_rules/services,assets/opengrep_rules/client"

# Non-exit mode (returns result object instead of calling process.exit)
node run.js ./src/checkRuleMetadata.js --exitOnError=false
```

Or via npm script:
```bash
npm run lint-rules
```

## Parameters

| Parameter       | Required | Default                                                         | Description |
|-----------------|----------|-----------------------------------------------------------------|-------------|
| `--dirs`        | No       | `assets/opengrep_rules/services,assets/opengrep_rules/client`  | Comma-separated directory paths to scan |
| `--basePath`    | No       | `process.cwd()`                                                 | Base path for relative directory resolution |
| `--exitOnError` | No       | `true`                                                          | Call `process.exit` on completion |

## Validation Rules

Each YAML rule file is checked for:
- `metadata.author` -- must be present
- `metadata.source` -- must match the expected GitHub URL pattern
- `metadata.category` -- must be one of: `security`, `correctness`, `privacy`

## Output

When `exitOnError=false`, returns `{ success: boolean, errors: string[] }`. Otherwise calls `process.exit(0)` or `process.exit(1)`.

## Prerequisites

- Rule YAML files in the specified directories

## Notes

- The `run.js` entry point automatically loads `.env` credentials
- Test files (`*.test.yaml`) are skipped
- This is a read-only validation tool -- it does not modify any files
