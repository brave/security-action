# Semgrep Compare Action

This GitHub Action compares Semgrep findings between the base branch rules and current branch rules, showing only the delta introduced by new or modified rules.

## Features

- **Ruleset Comparison**: Runs Semgrep twice - once with base branch rules, once with current branch rules
- **Delta Analysis**: Shows only new findings introduced by rule changes
- **Percentage Metrics**: Displays percentage increase/decrease in findings
- **Git Worktrees**: Uses git worktrees for efficient parallel rule comparison
- **Local Directory Support**: Can scan already-checked-out directories (skips cloning)
- **GitHub Links**: Clickable line numbers linking directly to findings in target repo
- **Auto Comment Management**: Posts/updates PR comments, removes old ones
- **Noise Reduction**: Limits output to avoid overwhelming large PRs

## How It Works

### Comparison Mode (Default)

1. **Detects changed rule files** - Uses `git diff` to find modified/added rules
2. **Creates git worktree** with base branch rules
3. **Runs Semgrep with changed rules only** on target (base version)
4. **Runs Semgrep with changed rules only** on target (current version)
5. **Calculates delta** - New findings, removed findings, new rules
6. **Reports only the changes** introduced by modified rules

**Example**: If you modify `check-vs-dcheck.yaml` and add `crypto-random.yaml`:
- ✅ Scans only with these 2 rules
- ❌ Skips all other 100+ rules in the repo
- 🚀 Much faster, focused on what changed

### Scan All Rules Mode

Set `changed_rules_only: false` to scan with all rules instead of just changed ones.

### Single Scan Mode

Set `compare_rules: false` to skip comparison and just scan with current rules.

## Usage

### Basic PR Workflow

```yaml
name: Semgrep Compare
on:
  pull_request:
    types: [opened, synchronize, reopened]
    paths:
      - 'assets/semgrep_rules/**'

permissions:
  contents: read
  pull-requests: write

jobs:
  compare:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
        with:
          fetch-depth: 0  # Need full history for worktrees

      - uses: ./actions/semgrep-compare
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          target_repo: brave/brave-core
```

### Using Local Directory (Skip Clone)

If you've already checked out the target repository, use `local_target` to avoid re-cloning:

```yaml
jobs:
  compare:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
        with:
          path: security-action
          fetch-depth: 0

      - uses: actions/checkout@v5
        with:
          repository: brave/brave-core
          path: brave-core

      - uses: ./security-action/actions/semgrep-compare
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          local_target: brave-core  # Use already checked out directory
```

### CLI Usage

```bash
# Compare base vs current rules on brave-core (clones repo)
./run.js ./src/semgrepCompare.js --target-repo=brave/brave-core

# Use local directory (skip clone)
./run.js ./src/semgrepCompare.js --local-target=/path/to/brave-core

# Disable comparison (single scan only)
./run.js ./src/semgrepCompare.js --target-repo=brave/brave-core --compare-rules=false

# Custom base branch
./run.js ./src/semgrepCompare.js --target-repo=brave/brave-core --base-ref=develop

# Scan with all rules (not just changed ones)
./run.js ./src/semgrepCompare.js --target-repo=brave/brave-core --changed-rules-only=false
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `github_token` | GitHub token for API access | Yes | - |
| `base_ref` | Base branch to compare against | No | PR base or `main` |
| `target_repo` | External repository to scan (e.g., `brave/brave-core`) | No | - |
| `target_path` | Subdirectory within target to scan | No | - |
| `local_target` | Local directory to scan (skips clone) | No | - |
| `compare_rules` | Compare base vs current rules | No | `true` |
| `changed_rules_only` | Only scan with modified/added rules | No | `true` |

**Notes**:
- Use either `target_repo` OR `local_target`, not both
- `changed_rules_only` uses `git diff` to detect modified rule files

## Outputs

| Output | Description |
|--------|-------------|
| `new_findings_count` | Number of new findings from rule changes |
| `has_new_findings` | Whether there are new findings (true/false) |
| `percentage_increase` | Percentage change in findings (e.g., 25.5) |
| `base_findings` | Number of findings with base rules |
| `total_findings` | Number of findings with current rules |

## Comment Format

The action posts a comment showing the delta:

```markdown
## Semgrep Findings

📈 **Comparison Results**

- Base branch findings: **150**
- Current branch findings: **165**
- Net change: **+15** (10.0%)
- New findings from rule changes: **18**
- New rules introduced: **2**

### Summary by Rule

| Rule ID | Findings | Severity | Change |
|---------|----------|----------|--------|
| `check-vs-dcheck` | 149 | WARNING | +10 |
| `crypto-random` | 16 | WARNING | 🆕 New |

### Detailed Findings

#### `check-vs-dcheck` (149 findings)

- **browser/foo.cc**
  - [Line 42](https://github.com/brave/brave-core/blob/main/browser/foo.cc#L42)
  - [Line 84](https://github.com/brave/brave-core/blob/main/browser/foo.cc#L84)
  - ... and 7 more

... and 8 more files

**Note**: Line numbers are clickable GitHub links pointing to the exact location in the target repository.
```

## Performance

- **Git Worktrees**: No need to clone entire repo twice
- **Shallow Clones**: Uses `--depth 1` for target repos
- **Parallel Scanning**: Base and current scans can leverage same target
- **Smart Cleanup**: Automatic cleanup of worktrees and temp directories

## Use Cases

### 1. PR Validation

Ensure new Semgrep rules don't add excessive noise:

```yaml
- uses: ./actions/semgrep-compare
  id: compare
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    target_repo: brave/brave-core

- name: Check Noise Level
  run: |
    if [ "${{ steps.compare.outputs.percentage_increase }}" -gt "50" ]; then
      echo "⚠️ Rules increased findings by >50%!"
      exit 1
    fi
```

### 2. Weekly Rule Testing

Test rules against latest brave-core:

```yaml
on:
  schedule:
    - cron: '0 9 * * 1'

jobs:
  test-rules:
    steps:
      - uses: actions/checkout@v5
        with:
          fetch-depth: 0

      - uses: ./actions/semgrep-compare
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          target_repo: brave/brave-core
          compare_rules: false  # Just scan, don't compare
```

### 3. Local Testing Before PR

```bash
# Clone brave-core once
git clone https://github.com/brave/brave-core.git /tmp/brave-core

# Test your rule changes multiple times
./run.js ./src/semgrepCompare.js --local-target=/tmp/brave-core
```

## Troubleshooting

**Error: "worktree already exists"**
- Cleanup: `git worktree prune`

**Error: "unknown revision"**
- Ensure `fetch-depth: 0` in checkout step

**Large output truncated**
- Action limits to 10 files/rule, 3 findings/file to avoid noise

## Examples

See [`.github/workflows/semgrep-brave-core.yml`](../../.github/workflows/semgrep-brave-core.yml) for a complete example.
