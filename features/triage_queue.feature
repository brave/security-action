Feature: Benchmark queue builder
  As the Phase A benchmark runner
  I want deterministic labeled case queues from the paper artifact datasets
  So that model bake-offs run on identical fixed samples

  Background:
    Given fixture dataset directories

  Scenario: OWASP cases carry pool labels, CWEs and remapped repo roots
    When the queue is built with seed 42, sampling 0 FP and 0 TP
    Then the queue has 8 items
    And item "owasp_fp_case_a" has dataset "owasp" and label "FP"
    And item "owasp_tp_case_c" has dataset "owasp" and label "TP"
    And item "owasp_fp_case_a" has cwe "22"
    And item "owasp_fp_case_a" has repo_root ending with "bench-local"
    And item "owasp_tp_case_c" has cwe "79"

  Scenario: Sampling is deterministic for a fixed seed
    When the queue is built with seed 42, sampling 1 FP and 1 TP
    And the queue is rebuilt with seed 42, sampling 1 FP and 1 TP
    Then the two queues are identical
    And the queue has 6 items

  Scenario: Sample respects pool membership and size
    When the queue is built with seed 7, sampling 1 FP and 1 TP
    Then the queue has 6 items
    And the queue has exactly 1 owasp item with label "FP"
    And the queue has exactly 1 owasp item with label "TP"

  Scenario: Vul4J cases join manifest ground truth and remap to checkouts
    When the queue is built with seed 42, sampling 0 FP and 0 TP
    Then the queue has 8 items
    And item "VUL4J-15_file_1" has dataset "vul4j" and label "TP"
    And item "VUL4J-15_file_1" has cwe "79"
    And item "VUL4J-15_file_1" has repo_root ending with "vul4j-checkouts/VUL4J-15"

  Scenario: Vul4J case without a manifest entry is skipped and reported
    Given a vul4j case "orphan_case" with no manifest entry
    When the queue is built with seed 42, sampling 0 FP and 0 TP
    Then the queue has 8 items
    And the queue reports skipped ids "orphan_case_1"

  Scenario: OSS-Fuzz cases join labels by alert id and remap snapshots
    When the queue is built with seed 42, sampling 0 FP and 0 TP
    Then the queue has 8 items
    And item "mpv-123_file.c_abc__agent" has dataset "ossfuzz" and label "FP"
    And item "mpv-123_file.c_abc__agent" has cwe "563"
    And item "mpv-123_file.c_abc__agent" has repo_root ending with "snapshots/buggy/mpv-123"

  Scenario: Queue order is stable regardless of directory listing order
    When the queue is built with seed 42, sampling 0 FP and 0 TP
    And the queue is rebuilt after shuffling fixture file listings
    Then the two queues are identical

  Scenario: Queue builds with only the OWASP dataset configured
    When the queue is built with only owasp, seed 42, sampling 2 FP and 1 TP
    Then the queue has 3 items
    And every item has dataset "owasp"

  Scenario: Queue builds with only OSS-Fuzz configured
    When the queue is built with only ossfuzz
    Then the queue has 2 items
    And every item has dataset "ossfuzz"
