# Security Action - Security Scanning GitHub Action

This project provides a GitHub Action and CLI tools for automated security scanning, code ownership analysis, Dependabot alert management, and Slack notifications for Brave repositories.

## Skills

The following skills are available in `.claude/skills/`. Load them with the `skill` tool when the user's request matches their description.

| Skill | Description |
|-------|-------------|
| `send-slack-message` | Send a message to a Slack channel with markdown support, colored attachments, and deduplication |
| `cleanup-slack-messages` | Clean up stale security-action Slack messages based on review signals |
| `delete-slack-messages` | Delete Slack messages from a channel by bot username and repo filter |
| `dependabot-nudge` | Scan org repos for open Dependabot alerts and notify maintainers |
| `dependabot-dismiss` | Auto-dismiss Dependabot alerts matching hotwords or a dismiss list |
| `match-codeowners` | Match changed files against a CODEOWNERS file to find owners |
| `get-config` | Fetch and parse a JSON config file from a GitHub repository |
| `get-properties` | Fetch custom properties for a GitHub repository |
| `get-maintainers` | List all repositories in an org with their maintainers property |
| `add-maintainer-property` | Auto-detect top maintainers and set the custom property on org repos |
| `renovate-sanity-check` | Check org repos for Renovate config compliance |
| `check-rule-metadata` | Validate metadata fields in opengrep/semgrep YAML rule files |
| `opengrep-compare` | Compare opengrep scan findings between current and base branch rules |

## Prerequisites

- Node.js >= 22
- `.env` file with `GITHUB_TOKEN` (for GitHub API tools)
- `.env` file with `SLACK_TOKEN` (for Slack tools)
- `.env` file with `GH_TO_SLACK_USER_MAP` (for Slack notification tools)
- See `.env.example` for the full list of environment variables

## Entry Point

All tools are run via `node run.js ./src/<script>.js` from the project root. The `run.js` entry point automatically loads `.env` credentials when the file exists.

## Credential Resolution

Most tools accept credentials as CLI parameters with automatic fallback to environment variables. The pattern is:

```js
token = token || process.env.GITHUB_TOKEN
```

Tools that accept a pre-constructed `github` (Octokit) instance will create one from `githubToken` if not provided. When running via `run.js`, all parameters come from `--flag=value` CLI arguments.

| Env Var | Used By | Notes |
|---------|---------|-------|
| `GITHUB_TOKEN` | Most tools (as `githubToken` param fallback) | Fine-grained PAT with repo + org permissions |
| `SLACK_TOKEN` | `sendSlackMessage`, `cleanupSecurityActionMessages`, `deleteSlackMessages` | Bot token (xoxb-...) |
| `GH_TO_SLACK_USER_MAP` | `dependabotNudge`, `cleanupSecurityActionMessages` | JSON mapping GitHub users to Slack mentions |
| `SEC_ACTION_DEBUG` | Shell scripts (`reviewdog.sh`) | Debug/verbose mode for scanners |
| `PYPI_INDEX_URL` | `pip-audit.py` | Custom PyPI index |
| `PYPI_INSECURE_HOSTS` | `pip-audit.py` | Trusted hosts for pip-audit |

## Development Workflow

### Linting

Before committing, always run:

```bash
npx standard --fix --ignore assets/opengrep_rules
```

### Testing

```bash
npm test
```

### Rule Metadata Validation

```bash
npm run lint-rules
```

### Opengrep Rule Testing

```bash
cd assets/opengrep_rules && opengrep test --strict .
```

### Commits

- Always commit self-contained changes, preferably under 800 lines of code.
- If you encounter errors related to SSH keys or commit signatures, ask the user to fix these.
