---
name: oss/gitlab.bandit.B323
rubric: safety
severity: should_fix
languages: [python]
cwe: [CWE-295]
---

**Rule.** The application was found creating a SSL context using the `_create_unverified_context`. This effectively disables the validation of server certificates. This allows for an adversary who is in between the application and the target host to intercept potentially sensitive information or transmit malicious data. To remediate this issue remove the call to `_create_unverified_context` and either create a default context using `ssl.create_default_context` or create a context with TLS 1.3. Example creating a TLS 1.3 client socket connection by using a newer version of Python (3.11.4) and the SSL module: ``` import ssl import socket # Create our initial socket with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock: # Connect the socket sock.connect(('www.example.org', 443)) # Create a new SSLContext with protocol set to ssl.PROTOCOL_TLS_CLIENT # This will auto-select the highest grade TLS protocol version (1.3) context = ssl.SSLContext(protocol=ssl.PROTOCOL_TLS_CLIENT) # Load our a certificates for server certificate authentication context.load_verify_locations('cert.pem') # Create our TLS socket, and validate the server hostname matches with context.wrap_socket(sock, server_hostname="www.example.org") as tls_sock: # Send some bytes over the socket (HTTP request in this case)\ data = bytes('GET / HTTP/1.1\r\nHost: example.org\r\n\r\n', 'utf-8') sent_bytes = tls_sock.send(data) # Validate number of sent bytes # ... # Read the response resp = tls_sock.recv() # Work with the response # ... ``` Unverified SSL context detected. This will permit insecure connections without `verifyingSSL` certificates. Use `ssl.create_default_context()` instead.

**Why.** Reported as CWE-295. Ported from opengrep rule `gitlab.bandit.B323` (generated/oss/audit.yaml).

## Examples

Bad:

```python
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B323` (metavariables start with `$`):

- `ssl._create_unverified_context(...)`
