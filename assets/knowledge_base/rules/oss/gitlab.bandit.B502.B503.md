---
name: oss/gitlab.bandit.B502.B503
rubric: safety
severity: should_fix
languages: [python]
---

**Rule.** An insecure SSL version was detected. TLS versions 1.0, 1.1, and all SSL versions are considered weak encryption and are deprecated. Use 'ssl.PROTOCOL_TLSv1_2' or higher.

**Why.** Reported as CWE-326: Inadequate Encryption Strength. Ported from opengrep rule `gitlab.bandit.B502.B503` (generated/oss/audit.yaml).

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

Literal patterns from opengrep rule `gitlab.bandit.B502.B503` (metavariables start with `$`):

- `ssl.PROTOCOL_SSLv2`
- `ssl.PROTOCOL_SSLv3`
- `ssl.PROTOCOL_TLSv1`
- `ssl.PROTOCOL_TLSv1_1`
- `pyOpenSSL.SSL.SSLv2_METHOD`
- `pyOpenSSL.SSL.SSLv23_METHOD`
- `pyOpenSSL.SSL.SSLv3_METHOD`
- `pyOpenSSL.SSL.TLSv1_METHOD`
- `pyOpenSSL.SSL.TLSv1_1_METHOD`
