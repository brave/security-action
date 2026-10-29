---
name: oss/gitlab.bandit.B507
rubric: safety
severity: should_fix
languages: [python]
---

**Rule.** The application was found to ignore host keys. Host keys are important as they provide assurance that the client can prove that the host is trusted. By ignoring these host keys, it is impossible for the client to validate the connection is to a trusted host. To remediate this issue, remove the call to `set_missing_host_key_policy(...)` which sets the host key policy. Instead, load key files using either `load_system_host_keys` or `load_host_keys` to only allow known good hosts. By not setting a host key policy for unknown hosts, `paramiko`'s default policy is to use `RejectPolicy`. Example configuration connecting to a known, trusted host, and not allowing connections to unknown hosts: ``` import paramiko # Create an SSH client with paramiko.SSHClient() as ssh: # Load the system host keys so we can confirm the # host we are connecting to is legitimate ssh.load_system_host_keys('/home/appuser/.ssh/known_hosts') # Connect to the remote host using our SSH private key ssh.connect(hostname='example.org', port=22, username='appuser', key_filename='/home/appuser/.ssh/private_key') ``` For more information on `set_missing_host_key_policy` see: - https://docs.paramiko.org/en/stable/api/client.html#paramiko.client.SSHClient.set_missing_host_key_policy

**Why.** Reported as CWE-322. Ported from opengrep rule `gitlab.bandit.B507` (generated/oss/audit.yaml).

## Examples

Bad:

```python
paramiko.client.AutoAddPolicy
paramiko.client.WarningPolicy
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B507` (metavariables start with `$`):

- `$CLIENT = paramiko.client.SSHClient(...)
...
$CLIENT.set_missing_host_key_policy(...)`
- `paramiko.client.AutoAddPolicy`
- `paramiko.client.WarningPolicy`
