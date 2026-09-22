Feature: Sandbox hardening workflow
  The sandbox hardening workflow runs the honeypot probes on every change
  to the sandbox surface so a regression in the deny-by-default posture
  breaks CI.

  Scenario: The workflow installs landrun before the probes
    When the sandbox hardening workflow is loaded
    Then a step runs the landrun installer
    And the honeypot probes run after the installer

  Scenario: The honeypot script checks the deny-by-default posture
    When the sandbox honeypot script is loaded
    Then it reads the .env honeypot and the ssh honeypot inside the sandbox
    And it probes a zero-network localhost connect
    And it probes a TLS 443 egress connect
    And it fails closed when the sandbox binary is missing