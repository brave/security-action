---
name: oss/gitlab.find-sec-bugs.COMMAND-INJECTION-1
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** OS command injection is a critical vulnerability that can lead to a full system compromise as it may allow an adversary to pass in arbitrary commands or arguments to be executed. User input should never be used in constructing commands or command arguments to functions which execute OS commands. This includes filenames supplied by user uploads or downloads. Ensure your application does not: - Use user-supplied information in the process name to execute. - Use user-supplied information in an OS command execution function which does not escape shell meta-characters. - Use user-supplied information in arguments to OS commands. The application should have a hardcoded set of arguments that are to be passed to OS commands. If filenames are being passed to these functions, it is recommended that a hash of the filename be used instead, or some other unique identifier. It is strongly recommended that a native library that implements the same functionality be used instead of using OS system commands, due to the risk of unknown attacks against third party commands. When specifying the OS command, ensure the application uses the full path information, otherwise the OS may attempt to look up which process to execute and could be vulnerable to untrusted search path vulnerabilities (CWE-426). Example of safely executing an OS command: ``` public static void executeCommand(String userFileData) throws java.io.IOException { // Generate a random filename, do not use user input String fileName = UUID.randomUUID().toString(); // Create a Buffered/FileWriter BufferedWriter writer = new BufferedWriter(new FileWriter(fileName)); // Write the user content to our random file writer.write(userFileData); // Close the file to flush contents writer.close(); // Create the process builder with a hardcoded path to the binary, and our randomly generated filename ProcessBuilder processBuilder = new ProcessBuilder("/opt/app/path", fileName); // Start the process Process process = processBuilder.start(); // Handle/redirect output of process here // ... } ``` For more information on OS command injection, see OWASP's guide: https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html

**Why.** Reported as CWE-78. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs.COMMAND_INJECTION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// untrusted input (source)
(javax.servlet.http.HttpServletRequest $R).$METHOD(...)
(java.util.Scanner $S).$METHOD(...)
(java.util.stream.Stream).$METHOD(...)
(java.util.StringJoiner $SJ).toString(...)
(java.sql.ResultSet.getString $R).$METHOD(...)
(java.lang.System $S).getProperty(...)
(java.lang.System $S).getenv(...)
(java.lang.StringBuilder $SB).toString(...)
(java.io.FileInputStream $F).read(...)
(java.io.FileReader $F).read(...)
(java.net.Socket $S).getInputStream(...)
(java.net.Socket $S).getOutputStream(...)
(java.net.DatagramSocket $S).receive(...)
(java.net.DatagramSocket $S).getInputStream(...)
java.nio.file.Files.readAllBytes(...)
java.nio.file.Files.readAllLines(...)
java.nio.file.Files.lines(...)
java.nio.file.Files.newBufferedReader(...)
org.apache.commons.io.IOUtils.toString(...)
org.apache.commons.io.IOUtils.readLines(...)
org.apache.commons.io.IOUtils.toByteArray(...)
(com.fasterxml.jackson.databind.ObjectMapper $OM).readValue(...)
(com.fasterxml.jackson.databind.ObjectMapper $OM).treeToValue(...)
$CLASS.$METHOD(..., (javax.servlet.http.HttpServletRequest $R), ...)
$FUNC(..., (javax.servlet.http.HttpServletRequest $R), ...)
// flows to sink without sanitization
(ProcessBuilder $PB).command(...)
new ProcessBuilder(...)
(Runtime $R).exec(...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.COMMAND_INJECTION-1` (metavariables start with `$`):

- `(javax.servlet.http.HttpServletRequest $R).$METHOD(...)`
- `(java.util.Scanner $S).$METHOD(...)`
- `(java.util.stream.Stream).$METHOD(...)`
- `(java.util.StringJoiner $SJ).toString(...)`
- `(java.sql.ResultSet.getString $R).$METHOD(...)`
- `(java.lang.System $S).getProperty(...)`
- `(java.lang.System $S).getenv(...)`
- `(java.lang.StringBuilder $SB).toString(...)`
- `(java.io.FileInputStream $F).read(...)`
- `(java.io.FileReader $F).read(...)`
- `(java.net.Socket $S).getInputStream(...)`
- `(java.net.Socket $S).getOutputStream(...)`
- `(java.net.DatagramSocket $S).receive(...)`
- `(java.net.DatagramSocket $S).getInputStream(...)`
- `java.nio.file.Files.readAllBytes(...)`
- `java.nio.file.Files.readAllLines(...)`
- `java.nio.file.Files.lines(...)`
- `java.nio.file.Files.newBufferedReader(...)`
- `org.apache.commons.io.IOUtils.toString(...)`
- `org.apache.commons.io.IOUtils.readLines(...)`
- `org.apache.commons.io.IOUtils.toByteArray(...)`
- `(com.fasterxml.jackson.databind.ObjectMapper $OM).readValue(...)`
- `(com.fasterxml.jackson.databind.ObjectMapper $OM).treeToValue(...)`
- `$CLASS.$METHOD(..., (javax.servlet.http.HttpServletRequest $R), ...)`
- `$FUNC(..., (javax.servlet.http.HttpServletRequest $R), ...)`
- `$FUNC(..., String $X, ...) { ... }`
- `$LIST.add($X)`
- `$MAP.put(..., $X)`
- `$STR.concat($X)`
- `$STR = String.format(..., $X, ...)`
- `$STR = String.join(..., $X, ...)`
- `(ProcessBuilder $PB).command(...)`
- `new ProcessBuilder(...)`
- `(Runtime $R).exec(...)`
