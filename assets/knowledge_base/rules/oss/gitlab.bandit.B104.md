---
name: oss/gitlab.bandit.B104
rubric: safety
severity: nit
languages: [python]
---

**Rule.** Binding to all network interfaces can potentially open up a service to traffic on unintended interfaces, that may not be properly documented or secured. By passing "0.0.0.0", "::" or an empty string as the address to the `socket.bind` function, the application will bind to all interfaces. Consider passing in the interface ip address through an environment variable, configuration file, or by determining the primary interface(s) IP address. Example getting the IP address from an environment variable `IP_ADDRESS`: ``` # Get the IP_ADDRESS env variable, or bind to # 127.0.0.1 if it is not set address = os.getenv("IP_ADDRESS", "127.0.0.1") # Create an internet socket sock = socket.socket(socket.AF_INET) # Set the port to listen on port = 9777 # Bind to the address and port combination sock.bind((address, port)) # Listen for connections sock.listen() # Handle the connection ```

**Why.** Reported as CWE-200. Ported from opengrep rule `gitlab.bandit.B104` (generated/oss/audit.yaml).

## Examples

Bad:

```python
$S = socket.socket(...)
...
$S.bind(("0.0.0.0", ...))
$S = socket.socket(...)
...
$S.bind(("::", ...))
$S = socket.socket(...)
...
$S.bind(("", ...))
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B104` (metavariables start with `$`):

- `$S = socket.socket(...)
...
$S.bind(("0.0.0.0", ...))`
- `$S = socket.socket(...)
...
$S.bind(("::", ...))`
- `$S = socket.socket(...)
...
$S.bind(("", ...))`
