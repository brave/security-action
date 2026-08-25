Feature: Discovering repositories from kube manifests
  Scan a directory of YAML files for GitRepository manifests and
  return unique org/name pairs filtered by organization.

  Scenario: GitRepository urls become org/name pairs
    Given a kube directory with a manifest for "ssh://git@github.com/example-org/example-ops"
    When getting the kube repositories
    Then the repositories are "example-org/example-ops"

  Scenario: Non GitRepository documents are ignored
    Given a kube directory with a manifest of kind "Deployment" for "ssh://git@github.com/example-org/example-ops"
    When getting the kube repositories
    Then no repositories are found

  Scenario: GitRepository documents without a url are ignored
    Given a kube directory with a GitRepository manifest without a url
    When getting the kube repositories
    Then no repositories are found

  Scenario: Duplicate repositories are deduplicated
    Given a kube directory with a manifest for "ssh://git@github.com/example-org/example-ops"
    And another manifest for "ssh://git@github.com/example-org/example-ops"
    When getting the kube repositories
    Then the repositories are "example-org/example-ops"

  Scenario: Multi-document YAML files are fully scanned
    Given a kube directory with a multi-document manifest for "ssh://git@github.com/org-a/repo-one" and "ssh://git@github.com/org-b/repo-two"
    When getting the kube repositories
    Then the repositories are "org-a/repo-one,org-b/repo-two"

  Scenario: Repositories are filtered by org
    Given a kube directory with a multi-document manifest for "ssh://git@github.com/org-a/repo-one" and "ssh://git@github.com/org-b/repo-two"
    When getting the kube repositories filtered by org "org-a"
    Then the repositories are "org-a/repo-one"

  Scenario: The org filter accepts regexes
    Given a kube directory with a multi-document manifest for "ssh://git@github.com/org-a/repo-one" and "ssh://git@github.com/org-b/repo-two"
    When getting the kube repositories filtered by org regex "^org-"
    Then the repositories are "org-a/repo-one,org-b/repo-two"

  Scenario: A directory is required
    When getting the kube repositories without a directory
    Then the action fails with "directory is required!"
