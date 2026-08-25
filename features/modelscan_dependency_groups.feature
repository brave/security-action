Feature: Modelscan dependency groups
  Decide which uv dependency groups (modelscan, tensorflow) must be
  synced for a given set of changed files.

  Scenario Outline: Suffix detection picks the groups to install
    Given modelscan is enabled with "all"
    And the environment has no SEC_ACTION_MODELSCAN_HEAVY
    When computing groups for the changed file "<file>"
    Then the groups are "<groups>"

    Examples:
      | file           | groups                  |
      | src/index.js   |                         |
      | model.pkl      | modelscan               |
      | data/model.npy | modelscan               |
      | net.pt         | modelscan               |
      | weights.h5     | modelscan               |
      | net.keras      | modelscan,tensorflow    |
      | graph.pb       | modelscan,tensorflow    |
      | MODEL.PKL      | modelscan               |
      | Deep.Weights.K |                         |

  Scenario: Modelscan disabled installs nothing
    Given modelscan is enabled with "false"
    When computing groups for changed files
      | model.pkl |
    Then the groups are ""

  Scenario: Scanner allow-list without heavy scanners skips tensorflow
    Given modelscan is enabled with "pickle,numpy"
    When computing groups for changed files
      | model.pkl |
      | net.keras  |
    Then the groups are "modelscan"

  Scenario: Scanner allow-list with keras enables tensorflow
    Given modelscan is enabled with "pickle,keras"
    When computing groups for changed files
      | net.keras |
    Then the groups are "modelscan,tensorflow"

  Scenario: Scanner allow-list with saved_model enables tensorflow
    Given modelscan is enabled with "saved_model"
    When computing groups for changed files
      | graph.pb |
    Then the groups are "modelscan,tensorflow"

  Scenario: Heavy env var forces both groups
    Given modelscan is enabled with "all"
    And the environment has SEC_ACTION_MODELSCAN_HEAVY set to 1
    When computing groups for changed files
      | src/index.js |
    Then the groups are "modelscan,tensorflow"

  Scenario: Heavy env var set to "false" does not force groups
    Given modelscan is enabled with "all"
    And the environment has SEC_ACTION_MODELSCAN_HEAVY set to false
    When computing groups for changed files
      | src/index.js |
    Then the groups are ""

  Scenario: No changed files installs nothing
    Given modelscan is enabled with "all"
    When computing groups for no changed files
    Then the groups are ""
