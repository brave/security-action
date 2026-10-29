Feature: Benchmark metrics
  As the Phase A benchmark runner
  I want FP-detection and TP-retention metrics from labeled results
  So that model bake-offs compare against the paper's numbers

  Scenario: Perfect prediction yields F1 1.0 and full TP retention
    Given triage results:
      | case | label | verdict |
      | a    | FP    | FP      |
      | b    | FP    | FP      |
      | c    | TP    | TP      |
      | d    | TP    | TP      |
    When the metrics are computed
    Then the FP recall is 1
    And the FP precision is 1
    And the F1 is 1
    And the TP retention is 1
    And the unknown rate is 0

  Scenario: Mixed predictions are counted per class
    Given triage results:
      | case | label | verdict |
      | a    | FP    | FP      |
      | b    | FP    | TP      |
      | c    | TP    | FP      |
      | d    | TP    | TP      |
    When the metrics are computed
    Then the FP recall is 0.5
    And the FP precision is 0.5
    And the F1 is 0.5
    And the TP retention is 0.5

  Scenario: UNKNOWN verdicts count toward neither class
    Given triage results:
      | case | label   | verdict |
      | a    | FP      | FP      |
      | b    | FP      | UNKNOWN |
      | c    | TP      | UNKNOWN |
      | d    | TP      | TP      |
    When the metrics are computed
    Then the FP recall is 0.5
    And the FP precision is 1
    And the TP retention is 0.5
    And the unknown rate is 0.5

  Scenario: Zero divisions degrade to zero
    Given triage results:
      | case | label | verdict |
      | a    | TP    | TP      |
    When the metrics are computed
    Then the FP recall is 0
    And the FP precision is 0
    And the F1 is 0
    And the TP retention is 1

  Scenario: Cost accumulates and CWE breakdown is produced
    Given triage results:
      | case | label | verdict | cwe | cost  |
      | a    | FP    | FP      | 78  | 0.001 |
      | b    | FP    | TP      | 78  | 0.002 |
      | c    | TP    | FP      | 327 | 0.003 |
      | d    | TP    | TP      | 327 | 0.004 |
    When the metrics are computed
    Then the total cost is 0.01
    And cwe "78" has FP recall 0.5
    And cwe "327" has TP retention 0.5

  Scenario: Runner-shaped rows (verdict object, cost nested in usage)
    Given triage results:
      | case | label | verdict                                        | usage              |
      | a    | FP    | {"label":"FP","confidence":"high"}             | {"cost":0.001}     |
      | b    | TP    | {"label":"TP","confidence":"high"}             | {"cost":0.002}     |
      | c    | FP    | {"label":"UNKNOWN","confidence":"low"}         | {"cost":0.0004}    |
    When the metrics are computed
    Then the FP recall is 0.5
    And the TP retention is 1
    And the unknown rate is about 0.333
    And the total cost is 0.0034
