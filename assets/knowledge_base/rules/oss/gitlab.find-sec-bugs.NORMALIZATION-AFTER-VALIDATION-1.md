---
name: oss/gitlab.find-sec-bugs.NORMALIZATION-AFTER-VALIDATION-1
rubric: safety
severity: should_fix
languages: [java]
cwe: [CWE-180]
---

**Rule.** The application was found matching a variable during a regular expression pattern match, and then calling a Unicode normalize function after validation has occurred. This is usually indicative of a poor input validation strategy as an adversary may attempt to exploit the normalization process. To remediate this issue, always perform Unicode normalization before any validation of a string. Example of normalizing a string before validation: ``` // User input possibly containing malicious unicode String userInput = "\uFE64" + "tag" + "\uFE65"; // Normalize the input userInput = Normalizer.normalize(userInput, Normalizer.Form.NFKC); // Compile our regex pattern looking for < or > characters Pattern pattern = Pattern.compile("[<>]"); // Create a matcher from the userInput Matcher matcher = pattern.matcher(userInput); // See if the matcher matches if (matcher.find()) { // It did so throw an error throw new Exception("found banned characters in input"); } ``` For more information see Carnegie Mellon University's Secure Coding Guide: https://wiki.sei.cmu.edu/confluence/display/java/IDS01-J.+Normalize+strings+before+validating+them

**Why.** Reported as CWE-180. Ported from opengrep rule `gitlab.find_sec_bugs.NORMALIZATION_AFTER_VALIDATION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
$Y = java.util.regex.Pattern.compile("[<>]");
...
$Y.matcher($VAR);
...
java.text.Normalizer.normalize($VAR, ...);
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.NORMALIZATION_AFTER_VALIDATION-1` (metavariables start with `$`):

- `$Y = java.util.regex.Pattern.compile("[<>]");
...
$Y.matcher($VAR);
...
java.text.Normalizer.normalize($VAR, ...);`
