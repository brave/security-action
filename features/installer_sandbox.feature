Feature: Sandbox dependency installers
  Installers that execute PR-controlled manifests (uv.lock, pnpm-lock.yaml)
  run inside the Landlock sandbox with a read-only workspace and egress
  limited to TLS (443).

  Scenario: The main action installs landrun before installing packages
    When the main action workflow is loaded
    Then a step imports the landrun installer
    And that step runs before the pnpm install step

  Scenario: The main action no longer installs Ruby gems
    When the main action workflow is loaded
    Then no step uses ruby setup with bundler cache

  Scenario: The pnpm install step is sandboxed
    When the main action workflow is loaded
    Then the pnpm install step wraps the install with the sandbox wrapper
    And the pnpm sandbox grants write access only to node modules caches and temp paths
    And the pnpm sandbox allows outbound TCP on port 443 only

  Scenario: uv sync runs inside the sandbox
    Given a uv sync command for action path "/opt/action" cwd "/home/ws" home "/home/u" and groups " --group modelscan"
    Then the uv sync command wraps uv with the sandbox wrapper
    And the uv sync sandbox grants write access only to the venv and uv caches
    And the uv sync sandbox allows outbound TCP on port 443 only
    And the uv sync command preserves the frozen sync arguments

  Scenario: The action script uses the uv sync command builder
    When the main action script is loaded
    Then uv sync is only invoked through the sandboxed command builder

  Scenario: Lint workflow installs landrun before pnpm install
    When the lint workflow is loaded
    Then a lint step runs the landrun installer
    And that lint step runs before the pnpm install step
    And the lint pnpm install step wraps the install with the sandbox wrapper

  Scenario: Lint workflow python coverage is sandboxed
    When the lint workflow is loaded
    Then the coverage py step wraps the toolchain with the sandbox wrapper
    And the coverage sandbox grants write access only to venv caches and temp paths
    And the coverage sandbox allows outbound TCP on port 443 only

  Scenario: Lint workflow pnpm audit is sandboxed
    When the lint workflow is loaded
    Then the pnpm audit step wraps the toolchain with the sandbox wrapper
    And the audit sandbox grants write access only to temp paths
    And the audit sandbox allows outbound TCP on port 443 only
