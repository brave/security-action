---
name: oss/gitlab.security-code-scan.SCS0001-1
rubric: safety
severity: should_fix
languages: [csharp]
---

**Rule.** OS command injection is a critical vulnerability that can lead to a full system compromise as it may allow an adversary to pass in arbitrary commands or arguments to be executed. User input should never be used in constructing commands or command arguments to functions which execute OS commands. This includes filenames supplied by user uploads or downloads. Ensure your application does not: - Use user-supplied information in the process name to execute. - Use user-supplied information in an OS command execution function which does not escape shell meta-characters. - Use user-supplied information in arguments to OS commands. The application should have a hardcoded set of arguments that are to be passed to OS commands. If filenames are being passed to these functions, it is recommended that a hash of the filename be used instead, or some other unique identifier. It is strongly recommended that a native library that implements the same functionality be used instead of using OS system commands, due to the risk of unknown attacks against third party commands. When specifying the OS command, ensure the application uses the full path information, otherwise the OS may attempt to look up which process to execute and could be vulnerable to untrusted search path vulnerabilities (CWE-426). Example of safely executing an OS command: ``` public void ExecuteCommand(string userFileData) { // generate a random filename, do not using user input string fileName = "C:\\Temp\\" + Guid.NewGuid(); File.WriteAllText(fileName, userFileData); using (Process process = new Process()) { // hardcode the full process path ProcessStartInfo processInfo = new ProcessStartInfo("C:\\App\\FileReader.exe"); // only pass in trust arguments, and never direct user input. processInfo.Arguments = fileName; processInfo.UseShellExecute = false; process.StartInfo = processInfo; process.Start(); } } ``` For more information on OS command injection, see OWASP's guide: https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html

**Why.** Reported as CWE-78. Ported from opengrep rule `gitlab.security_code_scan.SCS0001-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
Process.Start($ARG)
(Process $PROC).StartInfo.FileName = <...$ARG...>;
(Process $PROC).StartInfo.Arguments = <...$ARG...>;
$PSINFO.Arguments = <...$ARG...>;
$PSINFO.FileName = <...$ARG...>;
```

Good:

```text
Process.Start("...")
```

## Detection hints

Literal patterns from opengrep rule `gitlab.security_code_scan.SCS0001-1` (metavariables start with `$`):

- `using System.Diagnostics;
...`
- `Process.Start($ARG)`
- `Process.Start("...")`
- `(Process $PROC).StartInfo.FileName = <...$ARG...>;`
- `(Process $PROC).StartInfo.Arguments = <...$ARG...>;`
- `$PSINFO = new ProcessStartInfo(...)
...
Process.Start($PSINFO)`
- `$PSINFO.Arguments = <...$ARG...>;`
- `$PSINFO.FileName = <...$ARG...>;`
