---
name: oss/gitlab.bandit.B401
rubric: safety
severity: should_fix
languages: [python]
cwe: [CWE-319]
---

**Rule.** The application was found using a telnet library. As telnet does not provide encryption, it is strongly recommended that communications use a more secure transport such as SSH. The [paramiko](https://www.paramiko.org/) library can be used to initiate SSH connections. Example using `paramiko` SSH client: ``` import paramiko import scp # Create an SSH client with paramiko.SSHClient() as ssh: # Load the system host keys so we can confirm the # host we are connecting to is legitimate ssh.load_system_host_keys('/home/appuser/.ssh/known_hosts') # Connect to the remote host using our SSH private key ssh.connect(hostname='example.org', port=22, username='appuser', key_filename='/home/appuser/.ssh/private_key') # Work with the connection ``` For more information on the paramiko module see: - https://www.paramiko.org/

**Why.** Reported as CWE-319. Ported from opengrep rule `gitlab.bandit.B401` (generated/oss/audit.yaml).

## Examples

Bad:

```python
import telnetlib
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B401` (metavariables start with `$`):

- `import telnetlib`
