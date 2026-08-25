Feature: GitHub org repository tools
  Maintain org-wide custom properties: list maintainers per repo,
  auto-detect top maintainers, and update the runtime property.

  Background:
    Given org "test-org"

  Scenario: Maintainers are listed as sorted markdown lines
    Given the org has repo properties
      | zeta   | bob,alice |
      | alpha  | carol     |
      | silent |           |
    When listing maintainers
    Then the maintainers output is
      | - https://github.com/test-org/alpha maintainers: carol    |
      | - https://github.com/test-org/zeta maintainers: bob, alice |

  Scenario: A GitHub client or token is required to list maintainers
    When listing maintainers without a github client
    Then the action fails with "either githubToken or github is required!"

  Scenario: The runtime property update validates its inputs
    When updating the runtime property without runtime
    Then the action fails with "runtime is required!"
    When updating the runtime property without repositories
    Then the action fails with "repositories is required!"
    When updating the runtime property without org
    Then the action fails with "org is required! No token can modify more than one org property."

  Scenario: The runtime property is patched for every repository
    Given repositories "test-org/one" and "test-org/two"
    When updating the runtime property to "python"
    Then the runtime property is patched for 2 repositories
    And the patched runtime value is "python"

  Scenario: Runtime repositories given as a string are filtered by org
    Given repositories "test-org/one" and "other-org/two"
    When updating the runtime property to "node" from a string
    Then the runtime property is patched for 1 repository

  Scenario: Secrets are masked when a core object is provided
    Given repositories "test-org/one"
    When updating the runtime property to "node" with a core object
    Then the runtime property is patched for 1 repository
    And core setSecret was called for "test-org" and "one"

  Scenario: Simple scan promotes top org contributors
    Given org members "alice", "bob" and "carol"
    And the org has public repos "repo-a" and "repo-b"
    And repo "repo-a" has contributors
      | alice | 10 |
      | bob   | 30 |
      | dave  | 99 |
    When adding the maintainer property in simple scan mode
    Then the maintainers property is set for repo "repo-a" to "bob,alice"
    And the maintainers property is not set for repo "repo-b"

  Scenario: Simple scan flags public repos without org contributors
    Given org members "alice"
    And the org has public repos "repo-a" and "repo-b"
    And repo "repo-a" has contributors
      | dave | 99 |
    When adding the maintainer property in simple scan mode
    Then the output lists repo "repo-a" as needing archival
    And no maintainer property is set

  Scenario: Simple scan skips configured repositories
    Given org members "alice"
    And the org has public repos "repo-a" and "repo-b"
    And the scanned repositories are "repo-a"
    When adding the maintainer property in simple scan mode
    Then no maintainer property is set

  Scenario: Commit scan counts commit authors into maintainers
    Given org members "alice", "bob" and "carol"
    And the org has public repos "repo-a"
    And repo "repo-a" has commits by
      | alice     | 3  |
      | bob       | 5  |
      | carol     | 2  |
      | dave      | 99 |
      | test[bot] | 99 |
    When adding the maintainer property in commit scan mode
    Then the maintainers property is set for repo "repo-a" to "bob,alice,carol"

  Scenario: Commit scan ignores configured maintainers
    Given org members "alice", "bob" and "carol"
    And the org has public repos "repo-a"
    And the ignored maintainers are "bob"
    And repo "repo-a" has commits by
      | alice | 3 |
      | bob   | 5 |
    When adding the maintainer property in commit scan mode
    Then the maintainers property is set for repo "repo-a" to "alice"

  Scenario: Commit scan flags repos where nobody qualifies
    Given org members "alice"
    And the org has public repos "repo-a"
    And repo "repo-a" has commits by
      | test[bot] | 99 |
    When adding the maintainer property in commit scan mode
    Then the output lists repo "repo-a" as needing archival
    And no maintainer property is set

  Scenario: Commit scan does not flag private repos without maintainers
    Given org members "alice"
    And the org has private repos "repo-a"
    And repo "repo-a" has commits by
      | test[bot] | 99 |
    When adding the maintainer property in commit scan mode
    Then the output is empty

  Scenario: Adding the maintainer property requires a github client
    When adding the maintainer property without a github client
    Then the action fails with "either githubToken or github is required!"
