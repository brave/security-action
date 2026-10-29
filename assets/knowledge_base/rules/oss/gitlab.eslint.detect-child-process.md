---
name: oss/gitlab.eslint.detect-child-process
rubric: safety
severity: should_fix
languages: [javascript, typescript]
cwe: [CWE-95]
---

**Rule.** OS command injection is a critical vulnerability that can lead to a full system compromise as it may allow an adversary to pass in arbitrary commands or arguments to be executed. User input should never be used in constructing commands or command arguments to functions which execute OS commands. This includes filenames supplied by user uploads or downloads. Ensure your application does not: - Use user-supplied information in the process name to execute. - Use user-supplied information in an OS command execution function which does not escape shell meta-characters. - Use user-supplied information in arguments to OS commands. The application should have a hardcoded set of arguments that are to be passed to OS commands. If filenames are being passed to these functions, it is recommended that a hash of the filename be used instead, or some other unique identifier. It is strongly recommended that a native library that implements the same functionality be used instead of using OS system commands, due to the risk of unknown attacks against third-party commands. When specifying the OS command, ensure the application uses the full path information, otherwise the OS may attempt to look up which process to execute and could be vulnerable to untrusted search path vulnerabilities (CWE-426). Example of safely executing an OS command: ``` const child_process = require('child_process'); const fs = require('fs'); const crypto = require('node:crypto'); const { mkdtempSync } = require('node:fs'); function executeCommand(userFileData) { // Create a temporary directory, preferably in an application directory // that only the application has access to. const fileDir = mkdtempSync('/tmp/tmpdir-'); // Generate a random filename, do not use user input const filePath = fileDir + path.sep + crypto.randomUUID(); // Write the user-supplied data to the temporary file. fs.writeFileSync(filePath, userFileData); // Execute a program with a hardcoded path to the binary child_process.exec(`/bin/cat ${filePath}`, (error, stdout, stderr) => { // Delete the temporary directory and file if no longer needed fs.rmSync(fileDir, { recursive: true, force: true }); if (error) { console.error(`exec error: ${error}`); return; } console.log(`stdout: ${stdout}`); console.error(`stderr: ${stderr}`); }); } ``` For more information on OS command injection, see OWASP's guide: https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html Detected non-literal calls to child_process.exec(). This could lead to a command injection vulnerability.

**Why.** Reported as CWE-95. Ported from opengrep rule `gitlab.eslint.detect-child-process` (generated/oss/security_noaudit_novuln.yaml).

## Examples

Bad:

```text
child_process.exec(...)
```

Good:

```text
child_process.exec('...')
```

## Detection hints

Literal patterns from opengrep rule `gitlab.eslint.detect-child-process` (metavariables start with `$`):

- `child_process.exec(...)`
- `child_process.exec('...')`
