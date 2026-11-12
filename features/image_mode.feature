Feature: Prebuilt image runtime guards
  When the action runs inside the prebuilt OCI image, a manifest at
  /opt/brave-security/manifest.json describes the baked tools and the
  lockfile hashes recorded at image build time. Installers must reuse the
  baked binaries without touching the network, dependency syncs must run
  offline when the checked-out lockfiles match the recorded hashes, and
  the apt step must be skipped when the system already provides xmllint.
  Outside the image (plain runners, PR branches) every guard is inert and
  the existing install path is unchanged.

  Scenario: Baked landrun is reused without download or PATH changes
    Given the system image manifest pins landrun "v0.1.17"
    And the system image provides the landrun binary
    When installing landrun
    Then no landrun download happens
    And GITHUB_PATH is not modified
    And the baked landrun binary is hash checked

  Scenario: Tampered baked landrun fails closed
    Given the system image manifest pins landrun "v0.1.17"
    And the system image provides a tampered landrun binary
    When installing landrun
    Then the action fails with "SHA256 hash mismatch! Landrun binary may have been tampered with."
    And no landrun download happens

  Scenario: Baked landrun with a stale manifest version falls back to install
    Given the system image manifest pins landrun "v0.1.16"
    And the system image provides the landrun binary
    And the downloaded landrun reports the pinned version
    And the release asset downloads "binary"
    When installing landrun
    Then the release asset is downloaded
    And the install completes without error

  Scenario: Baked opengrep is reused without download or PATH changes
    Given the system image manifest pins opengrep "v1.32.0"
    And the system image provides the opengrep binary
    When installing opengrep
    Then no download happens
    And GITHUB_PATH is not modified
    And the baked opengrep binary is hash checked

  Scenario: Tampered baked opengrep fails closed
    Given the system image manifest pins opengrep "v1.32.0"
    And the system image provides a tampered opengrep binary
    When installing opengrep
    Then the action fails with "SHA256 hash mismatch! Opengrep binary may have been tampered with."
    And no download happens

  Scenario: A matching uv lock hash makes the sync offline
    Given the system image manifest records the uv lock hash
    And the action checkout has the matching uv lock hash
    Then the uv sync command runs offline

  Scenario: A mismatched uv lock hash keeps the sync online
    Given the system image manifest records the uv lock hash
    And the action checkout has a different uv lock hash
    Then the uv sync command runs online

  Scenario: No manifest keeps the sync online
    Given no system image manifest exists
    And the action checkout has a uv lock hash
    Then the uv sync command runs online

  Scenario: A matching pnpm lock hash makes the install offline
    Given the system image manifest records the pnpm lock hash
    And the action checkout has the matching pnpm lock hash
    Then the pnpm offline decision is true

  Scenario: A mismatched pnpm lock hash keeps the install online
    Given the system image manifest records the pnpm lock hash
    And the action checkout has a different pnpm lock hash
    Then the pnpm offline decision is false

  Scenario: xmllint on PATH skips the apt step
    Given xmllint is available on PATH
    Then the xmllint apt install is skipped

  Scenario: Missing xmllint keeps the apt step
    Given xmllint is not available on PATH
    Then the xmllint apt install is required

  Scenario: The shim builds the action context from runner environment
    Given a runner environment with repository "brave/core" and event "pull_request"
    And an event payload file describing pull request 42
    When the shim builds the github-script surface
    Then the context repo is "brave/core"
    And the context event name is "pull_request"
    And the context actor is the runner actor
    And the context issue number is 42
    And the context payload mirrors the event file

  Scenario: The shim issue number falls back to the pull request
    Given a runner environment with repository "brave/core" and event "pull_request"
    And an event payload file without an issue
    When the shim builds the github-script surface
    Then the context issue number is 42

  Scenario: The shim core writes step outputs and masks secrets
    Given a runner environment with repository "brave/core" and event "pull_request"
    And an event payload file describing pull request 42
    When the shim builds the github-script surface
    Then core setOutput appends to the GITHUB_OUTPUT file
    And core setSecret emits an add-mask workflow command

  Scenario: The shim core falls back to set-output commands without GITHUB_OUTPUT
    Given a runner environment with repository "brave/core" and event "pull_request"
    And an event payload file describing pull request 42
    And no GITHUB_OUTPUT file is configured
    When the shim builds the github-script surface
    Then core setOutput emits a set-output workflow command

  Scenario: The shim github client is an authenticated octokit
    Given a runner environment with repository "brave/core" and event "pull_request"
    And an event payload file describing pull request 42
    And a GITHUB_TOKEN of "ghs-test"
    When the shim builds the github-script surface
    Then the github client authenticates with the runner token
    And the github client exposes the rest and paginate surface
