---
name: oss/trailofbits.generic.curl-unencrypted-url.curl-unencrypted-url
rubric: safety
severity: should_fix
languages: [generic]
---

**Rule.** Found `curl` command with unencrypted URL (e.g. HTTP, FTP, etc.)

**Why.** Reported as CWE-319: Cleartext Transmission of Sensitive Information. See https://curl.se/docs/manpage.html. Ported from opengrep rule `trailofbits.generic.curl-unencrypted-url.curl-unencrypted-url` (generated/oss/audit.yaml).

## Examples

Bad:

```text
curl ... http://
curl ... ftp://
```

Good:

```text
curl ... http://127.0.0.1
curl ... http://localhost
curl ... http://169.254.169.254
curl ... http://[fd00:ec2::254]
curl ... http://metadata.google.internal
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.generic.curl-unencrypted-url.curl-unencrypted-url` (metavariables start with `$`):

- `curl ... http://`
- `curl ... ftp://`
- `curl ... http://127.0.0.1`
- `curl ... http://localhost`
- `curl ... http://169.254.169.254`
- `curl ... http://[fd00:ec2::254]`
- `curl ... http://metadata.google.internal`
