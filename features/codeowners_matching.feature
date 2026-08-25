Feature: CODEOWNERS matching
  Match changed files against a CODEOWNERS file to determine code owners,
  following GitHub's pattern semantics (gitignore-style globs, last
  matching pattern wins).

  Background:
    Given a temporary workspace

  Scenario: CODEOWNERS discovery follows GitHub's search order
    Given a CODEOWNERS file only at ".github/CODEOWNERS"
    Then the discovered CODEOWNERS path ends with ".github/CODEOWNERS"

    Given a CODEOWNERS file only at "CODEOWNERS"
    Then the discovered CODEOWNERS path ends with "/CODEOWNERS"

    Given a CODEOWNERS file only at "docs/CODEOWNERS"
    Then the discovered CODEOWNERS path ends with "docs/CODEOWNERS"

    Given no CODEOWNERS file anywhere
    Then no CODEOWNERS path is discovered

  Scenario: Parsing skips comments, blanks and malformed lines
    Given a CODEOWNERS file containing
      """
      # a comment
      * @default-team

      /docs @docs-team extra-owner

      justapattern
      """
    Then parsing yields 2 patterns
    And pattern 1 is "*" with owners "@default-team"
    And pattern 2 is "/docs" with owners "@docs-team,extra-owner"

  Scenario: Empty or missing file parses to no patterns
    Given no CODEOWNERS file anywhere
    Then parsing yields 0 patterns

  Scenario Outline: Glob pattern semantics
    Given the pattern "<pattern>"
    Then it matches "<file>"
    And it does not match "<nonfile>"

    Examples:
      | pattern      | file         | nonfile        |
      | *.md         | README.md    | README.txt     |
      | src/*        | src/a.js     | lib/a.js       |
      | src/**       | src/a/b.js   | lib/a.js       |
      | /src/*       | src/a.js     | lib/src/a.js   |
      | docs/        | docs/a/b.md  | other/a.md     |
      | a/**/b       | a/x/y/b      | a/x/y/c        |
      | /build/      | build/out.js | src/build/x.js |

  Scenario: Last matching pattern wins
    Given the patterns
      | pattern | owners        |
      | *.js    | @js-team      |
      | src/*   | @src-team     |
    When finding owners of "src/a.js"
    Then the owners are "@src-team"

  Scenario: Non-matching file has no owners
    Given the patterns
      | pattern | owners    |
      | *.js    | @js-team  |
    When finding owners of "docs/readme.md"
    Then the owners are ""

  Scenario: Full matching maps files to owners with stats
    Given a CODEOWNERS file containing
      """
      /src/ @src-team
      *.md @docs-team
      """
    When matching changed files
      | src/a.js      |
      | src/deep/b.js |
      | README.md     |
      | unknown.bin   |
    Then owner "@src-team" owns "src/a.js,src/deep/b.js"
    And owner "@docs-team" owns "README.md"
    And files without owners are "unknown.bin"
    And the stats report 4 total, 3 with owners, 1 without, 2 unique owners

  Scenario: Teams and individuals are classified
    Given a CODEOWNERS file containing
      """
      /src/ @bob @org/other-team
      """
    When matching changed files
      | src/a.js |
    Then the team list is "@org/other-team"
    And the individual list is "@bob"

  Scenario: Debug logging is enabled by the string "true"
    Given a CODEOWNERS file containing
      """
      * @default-team
      """
    When matching changed files with debug "true"
      | a.js |
    Then the debug log contains "Codeowners matching results"
