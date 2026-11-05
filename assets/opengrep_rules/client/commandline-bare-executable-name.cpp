// Test cases for commandline-bare-executable-name rule

// SHOULD TRIGGER: bare name resolved via PATH
// ruleid: commandline-bare-executable-name
base::CommandLine command_line(base::FilePath(L"PowerShell"));
// ruleid: commandline-bare-executable-name
base::CommandLine cmd(base::FilePath(L"PowerShell.exe"));
// ruleid: commandline-bare-executable-name
base::CommandLine cmd2(base::FilePath("netsh"));
// ruleid: commandline-bare-executable-name
base::CommandLine(base::FilePath(L"PowerShell")).AppendArguments(args, false);

// SHOULD NOT TRIGGER: absolute path or pre-computed path supplied
// ok: commandline-bare-executable-name
base::CommandLine cmd3(base::FilePath(L"C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe"));
// ok: commandline-bare-executable-name
base::FilePath absolute = GetPowershellPath();
base::CommandLine cmd4(absolute);