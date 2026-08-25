Feature: Test infrastructure smoke
  Verify the BDD harness, shared mock factories and property-testing
  dependencies are wired correctly.

  Scenario: Cucumber wiring works
    Given the BDD world provides mock factories
    Then cucumber executes scenarios successfully

  Scenario: fast-check is importable
    Given fast-check is available
    Then a property can be asserted
