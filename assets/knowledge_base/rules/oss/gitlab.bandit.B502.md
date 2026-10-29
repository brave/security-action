---
name: oss/gitlab.bandit.B502
rubric: safety
severity: should_fix
languages: [python]
cwe: [CWE-326]
---

**Rule.** The application was found calling an SSL module with SSL or TLS protocols that have known deficiencies. It is strongly recommended that newer applications use TLS 1.2 or 1.3 and `SSLContext.wrap_socket`. If using the `pyOpenSSL` module, please note that it has been deprecated and the Python Cryptographic Authority strongly suggests moving to use the [pyca/cryptography](https://github.com/pyca/cryptography) module instead. To remediate this issue for the `ssl` module, create a new TLS context and pass in `ssl.PROTOCOL_TLS_CLIENT` for clients or `ssl.PROTOCOL_TLS_SERVER` for servers to the `ssl.SSLContext(...)` `protocol=` argument. When converting the socket to a TLS socket, use the new `SSLContext.wrap_socket` method instead. Example creating a TLS 1.3 client socket connection by using a newer version of Python (3.11.4) and the SSL module: ``` import ssl import socket # Create our initial socket with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock: # Connect the socket sock.connect(('www.example.org', 443)) # Create a new SSLContext with protocol set to ssl.PROTOCOL_TLS_CLIENT # This will auto-select the highest grade TLS protocol version (1.3) context = ssl.SSLContext(protocol=ssl.PROTOCOL_TLS_CLIENT) # Load our a certificates for server certificate authentication context.load_verify_locations('cert.pem') # Create our TLS socket, and validate the server hostname matches with context.wrap_socket(sock, server_hostname="www.example.org") as tls_sock: # Send some bytes over the socket (HTTP request in this case)\ data = bytes('GET / HTTP/1.1\r\nHost: example.org\r\n\r\n', 'utf-8') sent_bytes = tls_sock.send(data) # Validate number of sent bytes # ... # Read the response resp = tls_sock.recv() # Work with the response # ... ``` For more information on the ssl module see: - https://docs.python.org/3/library/ssl.html For more information on pyca/cryptography and openssl see: - https://cryptography.io/en/latest/openssl/

**Why.** Reported as CWE-326. Ported from opengrep rule `gitlab.bandit.B502` (generated/oss/audit.yaml).

## Examples

Bad:

```python
ssl.PROTOCOL_SSLv2
ssl.PROTOCOL_SSLv3
ssl.PROTOCOL_TLSv1
ssl.PROTOCOL_TLSv1_1
pyOpenSSL.SSL.SSLv2_METHOD
pyOpenSSL.SSL.SSLv23_METHOD
pyOpenSSL.SSL.SSLv3_METHOD
pyOpenSSL.SSL.TLSv1_METHOD
pyOpenSSL.SSL.TLSv1_1_METHOD
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B502` (metavariables start with `$`):

- `ssl.PROTOCOL_SSLv2`
- `ssl.PROTOCOL_SSLv3`
- `ssl.PROTOCOL_TLSv1`
- `ssl.PROTOCOL_TLSv1_1`
- `pyOpenSSL.SSL.SSLv2_METHOD`
- `pyOpenSSL.SSL.SSLv23_METHOD`
- `pyOpenSSL.SSL.SSLv3_METHOD`
- `pyOpenSSL.SSL.TLSv1_METHOD`
- `pyOpenSSL.SSL.TLSv1_1_METHOD`
