---
name: oss/gitlab.find-sec-bugs.MODIFICATION-AFTER-VALIDATION-1
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** The application was found matching a variable during a regular expression pattern match, and then calling string modification functions after validation has occurred. This is usually indicative of a poor input validation strategy as an adversary may attempt to exploit the removal of characters. For example a common mistake in attempting to remove path characters to protect against path traversal is to match '../' and then remove any matches. However, if an adversary were to include in their input: '....//' then the `replace` method would replace the first `../` but cause the leading `..` and trailing `/` to join into the final string of `../`, effectively bypassing the check. To remediate this issue always perform string modifications before any validation of a string. It is strongly recommended that strings be encoded instead of replaced or removed prior to validation. Example replaces `..` before validation. Do note this is still not a recommended method for protecting against directory traversal, always use randomly generated IDs or filenames instead: ``` // This is ONLY for demonstration purpose, never use untrusted input // in paths, always use randomly generated filenames or IDs. String input = "test../....//dir"; // Use replaceAll _not_ replace input = input.replaceAll("\\.\\.", ""); // Input would be test///dir at this point // Create a pattern to match on Pattern pattern = Pattern.compile("\\.\\."); // Create a matcher Matcher match = pattern.matcher(input); // Call find to see if .. is still in our string if (match.find()) { throw new Exception(".. detected"); } // Use the input (but do not modify the string) System.out.println(input + " safe"); ``` For more information see Carnegie Mellon University's Secure Coding Guide: https://wiki.sei.cmu.edu/confluence/display/java/IDS11-J.+Perform+any+string+modifications+before+validation

**Why.** Reported as CWE-182. Ported from opengrep rule `gitlab.find_sec_bugs.MODIFICATION_AFTER_VALIDATION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
(java.util.regex.Pattern $Y).matcher($VAR);
...
$VAR.$METHOD(...);
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.MODIFICATION_AFTER_VALIDATION-1` (metavariables start with `$`):

- `(java.util.regex.Pattern $Y).matcher($VAR);
...
$VAR.$METHOD(...);`
- `(replace|replaceAll|replaceFirst|concat)`
