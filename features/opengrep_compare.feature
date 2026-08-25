Feature: Opengrep rule comparison
  Compare opengrep scan findings between base and current branch rule sets.
  Git and opengrep commands are injected fakes; no real repositories run.

  Background:
    Given a local target scan of "/tmp/target"

  Scenario: No changed rule files
    Given git reports no changed rule files
    When comparing rules
    Then the result has no changes
    And the result reports 0 total findings

  Scenario: Changed rule detection fails
    Given git diff fails with "base branch not fetched"
    When comparing rules
    Then the action fails with "Failed to detect changed rule files: base branch not fetched"

  Scenario: New rule introduced on top of base findings
    Given git reports one changed rule file that exists in the base branch
    And the base opengrep scan reports findings
      """
      {"results":[{"check_id":"a.old","path":"/tmp/target/x.js","start":{"line":1},"extra":{"severity":"WARNING","message":"old"}}],"errors":[]}
      """
    And the current opengrep scan reports findings
      """
      {"results":[{"check_id":"a.old","path":"/tmp/target/x.js","start":{"line":1},"extra":{"severity":"WARNING","message":"old"}},{"check_id":"b.new","path":"/tmp/target/y.js","start":{"line":2},"extra":{"severity":"ERROR","message":"new"}}],"errors":[]}
      """
    When comparing rules
    Then the result reports 2 total findings
    And the result reports 2 rules triggered
    And the delta lists 1 new rule
    And the delta lists 1 new finding
    And the delta lists 0 removed findings
    And the percentage increase is 100
    And the base total is 1

  Scenario: Removed findings are tracked
    Given git reports one changed rule file that exists in the base branch
    And the base opengrep scan reports findings
      """
      {"results":[{"check_id":"a.old","path":"/tmp/target/x.js","start":{"line":1},"extra":{"severity":"WARNING","message":"old"}},{"check_id":"a.old","path":"/tmp/target/y.js","start":{"line":2},"extra":{"severity":"WARNING","message":"old"}}],"errors":[]}
      """
    And the current opengrep scan reports findings
      """
      {"results":[{"check_id":"a.old","path":"/tmp/target/x.js","start":{"line":1},"extra":{"severity":"WARNING","message":"old"}}],"errors":[]}
      """
    When comparing rules
    Then the delta lists 0 new rules
    And the delta lists 0 new findings
    And the delta lists 1 removed finding
    And the percentage increase is -50
    And the base total is 2

  Scenario: All changed rules are new
    Given git reports one new rule file that is missing in the base branch
    And the current opengrep scan reports findings
      """
      {"results":[{"check_id":"c.brand","path":"/tmp/target/z.js","start":{"line":3},"extra":{"severity":"ERROR","message":"brand"}},{"check_id":"c.brand","path":"/tmp/target/w.js","start":{"line":4},"extra":{"severity":"ERROR","message":"brand"}}],"errors":[]}
      """
    When comparing rules
    Then the delta lists 1 new rule
    And the delta lists 2 new findings
    And the base total is 0
    And the percentage increase is 100

  Scenario: Rule comparison disabled
    Given git reports one changed rule file that exists in the base branch
    And the current opengrep scan reports findings
      """
      {"results":[{"check_id":"a.old","path":"/tmp/target/x.js","start":{"line":1},"extra":{"severity":"WARNING","message":"old"}}],"errors":[]}
      """
    When comparing rules with rule comparison disabled
    Then the result reports 1 total findings
    And the result has no delta
    And the base total is unknown

  Scenario: Current worktree creation fails
    Given git reports one changed rule file that exists in the base branch
    And creating the current worktree fails with "worktree boom"
    When comparing rules
    Then the action fails with "Failed to create current worktree: worktree boom"

  Scenario: Base worktree creation fails
    Given git reports one changed rule file that exists in the base branch
    And creating the base worktree fails with "worktree boom"
    When comparing rules
    Then the action fails with "Failed to create base branch worktree for main: worktree boom"

  Scenario: Base worktree creation needs a fetch first
    Given git reports one changed rule file that exists in the base branch
    And creating the base worktree fails once before a fetch
    And the base opengrep scan reports findings
      """
      {"results":[{"check_id":"a.old","path":"/tmp/target/x.js","start":{"line":1},"extra":{"severity":"WARNING","message":"old"}}],"errors":[]}
      """
    And the current opengrep scan reports findings
      """
      {"results":[{"check_id":"a.old","path":"/tmp/target/x.js","start":{"line":1},"extra":{"severity":"WARNING","message":"old"}}],"errors":[]}
      """
    When comparing rules
    Then the result reports 1 total findings
    And the base branch is fetched

  Scenario: Unparseable opengrep output yields no findings
    Given git reports one changed rule file that exists in the base branch
    And the base opengrep scan outputs garbage
    And the current opengrep scan outputs garbage
    When comparing rules
    Then the result reports 0 total findings
    And the result reports 0 rules triggered

  Scenario: Changed-rules-only disabled uses rule discovery
    Given rule discovery finds rule files on both branches
    And the base opengrep scan reports findings
      """
      {"results":[{"check_id":"a.old","path":"/tmp/target/x.js","start":{"line":1},"extra":{"severity":"WARNING","message":"old"}}],"errors":[]}
      """
    And the current opengrep scan reports findings
      """
      {"results":[{"check_id":"a.old","path":"/tmp/target/x.js","start":{"line":1},"extra":{"severity":"WARNING","message":"old"}}],"errors":[]}
      """
    When comparing rules with changed-rules-only disabled
    Then the result reports 1 total findings
    And git diff is never called

  Scenario: Cloned target repository is scanned and cleaned up
    Given the target repository "brave/brave-browser" is cloned
    And git reports one changed rule file that exists in the base branch
    And the base opengrep scan reports findings
      """
      {"results":[{"check_id":"a.old","path":"x.js","start":{"line":1},"extra":{"severity":"WARNING","message":"old"}}],"errors":[]}
      """
    And the current opengrep scan reports findings
      """
      {"results":[{"check_id":"a.old","path":"x.js","start":{"line":1},"extra":{"severity":"WARNING","message":"old"}}],"errors":[]}
      """
    When comparing rules
    Then the result reports 1 total findings
    And the target repo default branch is "main"
    And the worktrees are cleaned up
    And the target repository clone is removed

  Scenario: Finding paths are stripped of the clone directory
    Given the target repository "brave/brave-browser" is cloned
    And git reports one changed rule file that exists in the base branch
    And the base opengrep scan reports findings under the clone
      """
      {"results":[{"check_id":"a.old","path":"<CLONE>/src/x.js","start":{"line":1},"extra":{"severity":"WARNING","message":"old"}}],"errors":[]}
      """
    And the current opengrep scan reports findings under the clone
      """
      {"results":[{"check_id":"a.old","path":"<CLONE>/src/x.js","start":{"line":1},"extra":{"severity":"WARNING","message":"old"}}],"errors":[]}
      """
    When comparing rules
    Then the finding path for rule "a.old" is "src/x.js"
