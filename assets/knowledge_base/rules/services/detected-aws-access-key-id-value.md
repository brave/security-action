---
name: services/detected-aws-access-key-id-value
rubric: safety
severity: should_fix
languages: [regex]
---

**Rule.** AWS Access Key ID Value detected. This is a sensitive credential and should not be hardcoded here. Instead, read this value from an environment variable or keep it in a separate, private file.

**Why.** Reported as CWE-798: Use of Hard-coded Credentials. See https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures. See https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_identifiers.html#identifiers-prefixes. See https://semgrep.dev/r?q=generic.secrets.security.detected-aws-access-key-id-value.detected-aws-access-key-id-value. Ported from opengrep rule `detected-aws-access-key-id-value` (services/detected-aws-access-key-id-value.yaml).

## Examples

Bad:

```text
(^|[^A-Za-z0-9])(A3T[A-Z0-9]|AKIA|AGPA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}
```

Good:

```text
(?i)example|sample|test|fake
```

## Detection hints

Literal patterns from opengrep rule `detected-aws-access-key-id-value` (metavariables start with `$`):

- `(^|[^A-Za-z0-9])(A3T[A-Z0-9]|AKIA|AGPA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}`
- `(?i)example|sample|test|fake`
