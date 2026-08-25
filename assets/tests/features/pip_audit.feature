Feature: pip audit scanner
  The pip audit wrapper audits requirements and pyproject lock files.

  Scenario: Requirements lines yield install commands
    Given a requirements file with the lines
      """
      django==1.0
      # comment
      --index-url https://example.com
      -e ./
      requests==2.0
      """
    And every line changed
    Then the install commands are
      | django==1.0 |
      | requests==2.0 |

  Scenario: Backslash continuations report the last line
    Given a requirements file with the lines
      """
      django==1.0 \
      --extra-arg
      flask==2.0
      """
    And every line changed
    Then the install commands with line numbers are
      | django==1.0 | 2 |
      | flask==2.0 | 3 |

  Scenario: Only changed requirements lines are audited
    Given a requirements file with the lines
      """
      django==1.0
      requests==2.0
      """
    And the changed lines
      | requests==2.0 |
    Then the install commands are
      | requests==2.0 |

  Scenario: Pyproject dependencies yield per dependency
    Given a pyproject file with the lines
      """
      [project]
      dependencies = [
        "requests>=2.0",
        "django==1.0",
      ]
      """
    And every line changed
    Then the install commands with line numbers are
      | requests>=2.0 | 3 |
      | django==1.0 | 4 |

  Scenario: Multiple dependencies on one line yield together
    Given a pyproject file with the lines
      """
      [project]
      dependencies = ["foo", "foobar"]
      """
    And every line changed
    Then the install commands with line numbers are
      | foo | 2 |
      | foobar | 2 |

  Scenario: Dependencies are matched only once
    Given a pyproject file with the lines
      """
      [project]
      dependencies = [
        "requests",
      ]
      description = "requests everywhere"
      """
    And every line changed
    Then the install commands with line numbers are
      | requests | 3 |

  Scenario: A pyproject without dependencies yields nothing
    Given a pyproject file with the lines
      """
      [project]
      name = "example"
      """
    And every line changed
    Then no install command is yielded

  Scenario: Commented pyproject lines are skipped
    Given a pyproject file with the lines
      """
      [project]
      dependencies = [
        "requests",
      ]
      # requests
      """
    And every line changed
    Then the install commands with line numbers are
      | requests | 3 |

  Scenario: Without a base ref every line is scanned
    Given a requirements file with the lines
      """
      django==1.0
      requests==2.0
      """
    And the file is written to disk without a base ref
    Then the install commands from the file are
      | django==1.0 | 1 |
      | requests==2.0 | 2 |

  Scenario: With a base ref only diff lines are scanned
    Given a requirements file with the lines
      """
      django==1.0
      requests==2.0
      """
    And the file is written to disk with base ref "main" and the diff
      """
      --- a/requirements.txt
      +++ b/requirements.txt
      +requests==2.0
      """
    Then the install commands from the file are
      | requests==2.0 | 2 |

  Scenario: Vulnerable dependencies are reported
    Given a requirements file with the lines
      """
      django==1.0
      """
    And the file is written to disk without a base ref
    And the file is among the changed files
    And the audit reports the vulnerability "GHSA-1" for "django" version "1.0"
    When the audit runs
    Then the output matches the finding pattern
      """
      M:.+:1 Requiring `django==1.0` imports packages with known vulnerabilities:<br><br>django 1.0:<br>1. GHSA-1<br><br>
      """

  Scenario: Vulnerabilities without aliases use their id
    Given a requirements file with the lines
      """
      django==1.0
      """
    And the file is written to disk without a base ref
    And the file is among the changed files
    And the audit reports the id-only vulnerability "PYSEC-9" for "django" version "1.0"
    When the audit runs
    Then the output matches the finding pattern
      """
      M:.+:1 Requiring `django==1.0` imports packages with known vulnerabilities:<br><br>django 1.0:<br>1. PYSEC-9<br><br>
      """

  Scenario: Clean dependencies are not reported
    Given a requirements file with the lines
      """
      django==1.0
      """
    And the file is written to disk without a base ref
    And the file is among the changed files
    And the audit reports no vulnerabilities
    When the audit runs
    Then no finding is printed

  Scenario: A venv failure is printed and skipped
    Given a requirements file with the lines
      """
      django==1.0
      """
    And the file is written to disk without a base ref
    And the file is among the changed files
    And the venv creation fails with "boom"
    When the audit runs
    Then no finding is printed
    And the venv failure "boom" is printed

  Scenario: An audit timeout is printed and skipped
    Given a requirements file with the lines
      """
      django==1.0
      """
    And the file is written to disk without a base ref
    And the file is among the changed files
    And the audit times out with "timed out"
    When the audit runs
    Then no finding is printed
    And the venv failure "timed out" is printed

  Scenario: The index and insecure hosts are passed to the venv
    Given a requirements file with the lines
      """
      django==1.0
      """
    And the file is written to disk without a base ref
    And the file is among the changed files
    And the audit reports no vulnerabilities
    And the PyPI index "https://pypi.example" with insecure hosts "host1,host2"
    When the audit runs
    Then the venv is created with install command "django==1.0 --trusted-host host1 --trusted-host host2" and index "https://pypi.example"

  Scenario: Only dependency lock files are audited
    Given the changed files
      """
      src/index.py
      docs/readme.md
      """
    And the audit reports the vulnerability "GHSA-1" for "django" version "1.0"
    When the audit runs
    Then no finding is printed
