Feature: Brave web search tool
  The agentic triage harness can query the Brave search API for external
  facts (library versions, CVE context). The tool is fail-closed: without
  an API key it is not created, and the registry reports the search tool
  as not configured.

  Background:
    Given a fake HTTP transport

  Scenario: Search returns numbered results
    Given the Brave API returns 2 results
    When the search tool runs with query "fastify ParserConfig defaultTyping"
    Then the search output lists 2 numbered results
    And the search output contains "https://example.com/cve"

  Scenario: Search with no results reports no results
    Given the Brave API returns no results
    When the search tool runs with query "obscure library"
    Then the search output is "no results"

  Scenario: API errors become tool errors
    Given the Brave API returns status 401
    When the search tool runs with query "anything"
    Then the search tool fails with error "Brave API 401 — unauthorized"

  Scenario: Missing API key rejects creation
    When createBraveSearch is called without an api key
    Then creation fails with error "Brave search not configured: missing API key"

  Scenario: Query spaces are encoded in the request URL
    Given the Brave API returns no results
    When the search tool runs with query "spring ParserConfig defaultTyping"
    Then the request URL contains "q=spring+ParserConfig+defaultTyping"

  Scenario: The subscription token header authenticates the request
    Given the Brave API returns no results
    When the search tool runs with query "anything"
    Then the request carries header "X-Subscription-Token" with value "brave-key-1"

  Scenario: The result count is requested explicitly
    Given the Brave API returns no results
    When the search tool runs with query "anything" and count 3
    Then the request URL contains "count=3"
