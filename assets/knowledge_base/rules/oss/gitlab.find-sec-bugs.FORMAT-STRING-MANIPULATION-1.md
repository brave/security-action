---
name: oss/gitlab.find-sec-bugs.FORMAT-STRING-MANIPULATION-1
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** The application allows user input to control format string parameters. By passing invalid format string specifiers an adversary could cause the application to throw exceptions or possibly leak internal information depending on application logic. Never allow user-supplied input to be used to create a format string. Replace all format string arguments with hardcoded format strings containing the necessary specifiers. Example of using `String.format` safely: ``` // Get untrusted user input String userInput = request.getParameter("someInput"); // Ensure that user input is not included in the first argument to String.format String.format("Hardcoded string expecting a string: %s", userInput); // ... ```

**Why.** Reported as CWE-134. Ported from opengrep rule `gitlab.find_sec_bugs.FORMAT_STRING_MANIPULATION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
String.format($FORMAT_STR, ...);
String.format(java.util.Locale.$LOCALE, $FORMAT_STR, ...);
(java.util.Formatter $F).format($FORMAT_STR, ...);
(java.util.Formatter $F).format(java.util.Locale.$LOCALE, $FORMAT_STR, ...);
(java.io.PrintStream $F).printf($FORMAT_STR, ...);
(java.io.PrintStream $F).printf(java.util.Locale.$LOCALE, $FORMAT_STR, ...);
(java.io.PrintStream $F).format($FORMAT_STR, ...);
(java.io.PrintStream $F).format(java.util.Locale.$LOCALE, $FORMAT_STR, ...);
System.out.printf($FORMAT_STR, ...);
System.out.printf(java.util.Locale.$LOCALE, $FORMAT_STR, ...);
System.out.format($FORMAT_STR, ...);
System.out.format(java.util.Locale.$LOCALE, $FORMAT_STR, ...);
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.FORMAT_STRING_MANIPULATION-1` (metavariables start with `$`):

- `String $INPUT = (HttpServletRequest $REQ).getParameter(...);
...`
- `String $FORMAT_STR = ... + $INPUT;
...`
- `String $FORMAT_STR = ... + $INPUT + ...;
...`
- `String $FORMAT_STR = ... + (HttpServletRequest $REQ).getParameter(...) + ...;
...`
- `String $FORMAT_STR = ... + (HttpServletRequest $REQ).getParameter(...);
...`
- `String.format($FORMAT_STR, ...);`
- `String.format(java.util.Locale.$LOCALE, $FORMAT_STR, ...);`
- `(java.util.Formatter $F).format($FORMAT_STR, ...);`
- `(java.util.Formatter $F).format(java.util.Locale.$LOCALE, $FORMAT_STR, ...);`
- `(java.io.PrintStream $F).printf($FORMAT_STR, ...);`
- `(java.io.PrintStream $F).printf(java.util.Locale.$LOCALE, $FORMAT_STR, ...);`
- `(java.io.PrintStream $F).format($FORMAT_STR, ...);`
- `(java.io.PrintStream $F).format(java.util.Locale.$LOCALE, $FORMAT_STR, ...);`
- `System.out.printf($FORMAT_STR, ...);`
- `System.out.printf(java.util.Locale.$LOCALE, $FORMAT_STR, ...);`
- `System.out.format($FORMAT_STR, ...);`
- `System.out.format(java.util.Locale.$LOCALE, $FORMAT_STR, ...);`
