Feature: modelscan audit scanner
  Identify model files by magic bytes and report scan findings as JSON lines.

  Scenario: Unset scanner selection enables every scanner
    Given no scanner selection
    Then every scanner is enabled

  Scenario: Explicit all enables every scanner
    Given the scanner selection "all"
    Then every scanner is enabled

  Scenario Outline: Falsey selections disable the scanner
    Given the scanner selection "<selection>"
    Then no scanner is enabled

    Examples:
      | selection |
      | false     |
      |  FALSE    |

  Scenario: An empty selection disables the scanner
    Given the empty scanner selection
    Then no scanner is enabled

  Scenario: A scanner list is normalized
    Given the scanner selection " Pickle , pytorch "
    Then the enabled scanners are "pickle,pytorch"

  Scenario: Unknown scanners are warned about and ignored
    Given the scanner selection "pickle,bogus"
    Then the enabled scanners are "pickle"
    And a warning mentions "bogus"

  Scenario Outline: Model files are identified by magic bytes or suffix
    Given a model file "<file>" with <magic> content
    Then the file is identified as "<scanner>" with heavyweight "<heavy>"

    Examples:
      | file    | magic           | scanner     | heavy |
      | m.pkl   | pickle protocol | pickle      | no    |
      | m.npy   | numpy           | numpy       | no    |
      | m.bin   | pytorch zip     | pytorch     | no    |
      | m.h5    | h5              | h5          | yes   |
      | m.keras | h5              | keras       | yes   |
      | m.pb    | anything        | saved_model | yes   |
      | m.txt   | unknown         | nothing     | no    |
      | m.pkl   | bad pickle      | nothing     | no    |
      | m.pkl   | truncated pickle| nothing     | no    |

  Scenario: Missing files are not identified
    When identifying the file "does-not-exist.bin"
    Then the file is identified as "nothing" with heavyweight "no"

  Scenario: Issues are emitted as JSON lines
    Given an issue with severity "HIGH" and details "eval call|__builtin__|eval|pickle"
    When emitting the issue for "m.pkl"
    Then the JSON output line is
      """
      {"path": "m.pkl", "severity": "HIGH", "description": "eval call", "module": "__builtin__", "operator": "eval", "scanner": "pickle"}
      """

  Scenario: output_json details take precedence
    Given an issue with output_json details
    When emitting the issue for "m.bin"
    Then the JSON output has description "fresh" and severity "CRITICAL"

  Scenario: Missing optional dependencies log and return nothing
    Given a scanner whose import fails with ImportError
    When scanning "m.keras" with it
    Then the scan result is none
    And the error output mentions "tensorflow"

  Scenario: Optional dependency scan failures are logged
    Given a scanner that raises while scanning
    When scanning "m.keras" with it
    Then the scan result is none
    And the error output mentions "boom"

  Scenario: Optional dependency scan results pass through
    Given a scanner that returns a result
    When scanning "m.keras" with it
    Then the scan result is the scanner result

  Scenario: A missing file list exits with status 1
    Given a script directory without a file list
    When running the audit
    Then the audit exits with status 1

  Scenario: Disabled scanners produce no output
    Given a file list with "m.pkl"
    And the scanner selection "false"
    When running the audit
    Then the audit output is empty

  Scenario: Findings are scanned and emitted
    Given a file list with a pickle file
    And the scanner selection "pickle"
    And the pickle scanner returns one issue
    When running the audit
    Then the JSON output has description "eval" and severity "HIGH"

  Scenario: Disabled scanners skip their files
    Given a file list with an h5 file
    And the scanner selection "pickle"
    And the h5 scanner must not run
    When running the audit
    Then the audit output is empty

  Scenario: Scan failures are logged and skipped
    Given a file list with a pickle file
    And the scanner selection "pickle"
    And the pickle scanner raises "boom"
    When running the audit
    Then the audit output is empty
    And the error output mentions "boom"

  Scenario: Missing SCRIPTPATH falls back to the script directory
    Given no SCRIPTPATH
    And the scanner selection "false"
    When running the audit
    Then the audit output is empty
