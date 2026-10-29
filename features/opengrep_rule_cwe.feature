Feature: Opengrep rules carry CWE metadata
  Vuln-class rules in client/ and services/ declare their CWE so the
  triage policy gate can reason about suppression eligibility.

  Scenario: Injection and traversal rules declare their CWE
    Given the opengrep ruleset
    Then rule "activerecord-sanitize-sql-noop" declares cwe "CWE-89"
    And rule "path-travesal-by-string-interpolation" declares cwe "CWE-22"
    And rule "no-backticks-in-js-handlers" declares cwe "CWE-79"
    And rule "svelte-html-usages" declares cwe "CWE-79"
    And rule "svelte-purifyConfig-usages" declares cwe "CWE-79"

  Scenario: Memory and type-safety rules declare their CWE
    Given the opengrep ruleset
    Then rule "chromium-bind-uaf" declares cwe "CWE-416"
    And rule "dangling-pointer-trait" declares cwe "CWE-416"
    And rule "raptor-mismatched-memory-management-cpp" declares cwe "CWE-762"
    And rule "reinterpret_cast" declares cwe "CWE-704"
    And rule "cast-signed-to-unsigned" declares cwe "CWE-195"
    And rule "raptor-signed-unsigned-conversion" declares cwe "CWE-195"
    And rule "brave-missing-break-in-switch" declares cwe "CWE-484"
    And rule "raptor-typos" declares cwe "CWE-480"

  Scenario: Origin and resource rules declare their CWE
    Given the opengrep ruleset
    Then rule "chromium-insecure-gurl" declares cwe "CWE-346"
    And rule "get-visible-entry" declares cwe "CWE-346"
    And rule "starts-with-partial-host-py" declares cwe "CWE-346"
    And rule "url-constructor-base" declares cwe "CWE-346"
    And rule "http-parse-multipart-dos" declares cwe "CWE-400"
    And rule "io-readall-dos" declares cwe "CWE-400"
    And rule "android-resolve-intent" declares cwe "CWE-927"
    And rule "brave-execute-script" declares cwe "CWE-94"
    And rule "brave-execute-script-ios" declares cwe "CWE-94"
    And rule "brave-isolated-world-id-content-end" declares cwe "CWE-94"
    And rule "unsafe-js-in-cpp-strings" declares cwe "CWE-94"
    And rule "web-ui-origin-encoding" declares cwe "CWE-116"
    And rule "nodejs-insecure-url-parse" declares cwe "CWE-20"
    And rule "not-using-hasownproperty-proto-access" declares cwe "CWE-1321"

  Scenario: Policy and hygiene rules intentionally have no CWE
    Given the opengrep ruleset
    Then rule "license-nonfree" declares no cwe
    And rule "privacy" declares no cwe
    And rule "const_cast" declares no cwe
    And rule "brave.gni_includes" declares no cwe
    And rule "glide-library" declares no cwe
    And rule "in-process-browser-test" declares no cwe
    And rule "browser-dependency-inversion" declares no cwe
    And rule "chromium-crash-vs-dump-without-crashing" declares no cwe
    And rule "sources_gni" declares no cwe
    And rule "web-contents-user-data" declares no cwe
    And rule "android-profile-original" declares no cwe
    And rule "android-profile-static" declares no cwe
    And rule "unsafe_cpp_constructs" declares no cwe
    And rule "chromium-security-dcheck-should-be-check" declares no cwe
    And rule "raptor-interesting-api-calls" declares no cwe
    And rule "refcounted-usage" declares no cwe
    And rule "internal-digest-call" declares no cwe
    And rule "find-links-without-no-index" declares no cwe
    And rule "pip-extra-index-url" declares no cwe

  Scenario: Every cwe metadata entry parses to a CWE-N id
    Given the opengrep ruleset
    Then every rule with cwe metadata has a well-formed CWE id
