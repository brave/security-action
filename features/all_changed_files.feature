Feature: Filtering the changed files list against the checkout
  The pull request files API lists paths as a diff against the current
  base branch head, but the scanners consume all_changed_files.txt
  against the checked-out merge commit. Paths that were renamed or
  deleted on the base branch after the pull request forked are listed
  yet absent from the working tree, and opening them crashes the
  scanners (scripttagextractor FileNotFoundError).

  Scenario: Paths missing from the checkout are dropped
    Given a workspace containing the files "app.py,src/lib/util.svelte"
    When filtering the changed files "app.py,src/lib/util.svelte,layouts/PageWidth.svelte"
    Then the kept files are "app.py,src/lib/util.svelte"
    And the dropped files are "layouts/PageWidth.svelte"

  Scenario: Paths that exist in the checkout are kept in order
    Given a workspace containing the files "b.py,a/c.js,d.svelte"
    When filtering the changed files "b.py,a/c.js,d.svelte"
    Then the kept files are "b.py,a/c.js,d.svelte"
    And no files are reported as dropped

  Scenario: Every path missing yields an empty list
    Given a workspace containing the files "README.md"
    When filtering the changed files "gone.svelte,gone.html"
    Then the kept files are ""
    And the dropped files are "gone.svelte,gone.html"

  Scenario: An empty changed files list stays empty
    Given a workspace containing the files "README.md"
    When filtering an empty changed files list
    Then the kept files are ""
    And no files are reported as dropped

  Scenario: Paths resolve relative to the workspace root
    Given a workspace containing the files "ws/services/x.py"
    When filtering the changed files "services/x.py" against workspace root "ws"
    Then the kept files are "services/x.py"
