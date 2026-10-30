---
name: oss/gitlab.find-sec-bugs-scala.FORMAT-STRING-MANIPULATION-1
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-134]
---

**Rule.** Allowing user input to control format parameters could enable an attacker to cause exceptions to be thrown or leak information.Attackers may be able to modify the format string argument, such that an exception is thrown. If this exception is left uncaught, it may crash the application. Alternatively, if sensitive information is used within the unused arguments, attackers may change the format string to reveal this information.

**Why.** Reported as CWE-134. Ported from opengrep rule `gitlab.find_sec_bugs_scala.FORMAT_STRING_MANIPULATION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
$VAL = <... $INPUT ...>
String.format($FORMAT_STR, ...);
String.format(java.util.Locale.$LOCALE, $FORMAT_STR, ...);
($F: java.util.Formatter).format($FORMAT_STR, ...);
($F: java.util.Formatter).format(java.util.Locale.$LOCALE, $FORMAT_STR, ...);
($F: java.io.PrintStream).printf($FORMAT_STR, ...);
($F: java.io.PrintStream).printf(java.util.Locale.$LOCALE, $FORMAT_STR, ...);
($F: java.io.PrintStream).format($FORMAT_STR, ...);
($F: java.io.PrintStream).format(java.util.Locale.$LOCALE, $FORMAT_STR, ...);
System.out.printf($FORMAT_STR, ...);
System.out.printf(java.util.Locale.$LOCALE, $FORMAT_STR, ...);
System.out.format($FORMAT_STR, ...);
System.out.format(java.util.Locale.$LOCALE, $FORMAT_STR, ...);
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.FORMAT_STRING_MANIPULATION-1` (metavariables start with `$`):

- `$INPUT = ($REQ: javax.servlet.http.HttpServletRequest).getParameter(...);
...`
- `$FORMAT_STR = <... $INPUT ...>;`
- `val $INPUT = ($REQ: javax.servlet.http.HttpServletRequest).getParameter(...);
...`
- `val $FORMAT_STR = <... $INPUT ...>;
...`
- `val $FORMAT_STR = ... + ($REQ: javax.servlet.http.HttpServletRequest).getParameter(...) + ...; ...`
- `val $FORMAT_STR = ... + ($REQ: javax.servlet.http.HttpServletRequest).getParameter(...); ...`
- `$VAL = <... $INPUT ...>`
- `String.format($FORMAT_STR, ...);`
- `String.format(java.util.Locale.$LOCALE, $FORMAT_STR, ...);`
- `($F: java.util.Formatter).format($FORMAT_STR, ...);`
- `($F: java.util.Formatter).format(java.util.Locale.$LOCALE, $FORMAT_STR, ...);`
- `($F: java.io.PrintStream).printf($FORMAT_STR, ...);`
- `($F: java.io.PrintStream).printf(java.util.Locale.$LOCALE, $FORMAT_STR, ...);`
- `($F: java.io.PrintStream).format($FORMAT_STR, ...);`
- `($F: java.io.PrintStream).format(java.util.Locale.$LOCALE, $FORMAT_STR, ...);`
- `System.out.printf($FORMAT_STR, ...);`
- `System.out.printf(java.util.Locale.$LOCALE, $FORMAT_STR, ...);`
- `System.out.format($FORMAT_STR, ...);`
- `System.out.format(java.util.Locale.$LOCALE, $FORMAT_STR, ...);`
