Feature: script tag extractor
  The extractor pulls <script> contents into separate files for semgrep.

  Scenario: Script contents are captured with positions
    Given an HTML document
      """
      <html>
      <script>
      var a = 1;
      </script>
      </html>
      """
    When the document is parsed
    Then one script is found at line 2
    And the script data contains "var a = 1;"

  Scenario: Text outside script tags is ignored
    Given an HTML document
      """
      <html><style>body { color: red; }</style><p>hello</p></html>
      """
    When the document is parsed
    Then no script is found

  Scenario: Tags are matched case-insensitively
    Given an HTML document
      """
      <SCRIPT>var b = 2;</SCRIPT>
      """
    When the document is parsed
    Then one script is found at line 1
    And the script data contains "var b = 2;"

  Scenario: Found scripts count their new lines
    Given a found script with the data
      """
      a
      b
      c
      """
    Then the script spans 2 new lines

  Scenario: Extracted scripts are aligned to their original lines
    Given an HTML document
      """
      <html>
      <script>a</script>
      <p>text</p>
      <script>b</script>
      </html>
      """
    When the scripts are extracted
    Then the extracted file "page.html.extractedscript.js" contains exactly
      """

      ; a

      ; b
      """

  Scenario: The original can be copied with a suffix
    Given an HTML document
      """
      <html><script>a</script></html>
      """
    When the scripts are extracted with the original copied to ".orig.html"
    Then the extracted file "page.html.extractedscript.js" contains exactly
      """
      ; a
      """
    And the copied file "page.html.orig.html" contains exactly
      """
      <html><script>a</script></html>
      """

  Scenario: A dry run writes nothing
    Given an HTML document
      """
      <html><script>a</script></html>
      """
    When a dry run extracts the scripts
    Then the extracted file "page.html.extractedscript.js" does not exist

  Scenario: Documents without scripts produce no output file
    Given an HTML document
      """
      <html><p>hello</p></html>
      """
    When the scripts are extracted
    Then the extracted file "page.html.extractedscript.js" does not exist
