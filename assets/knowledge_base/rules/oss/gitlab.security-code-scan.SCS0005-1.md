---
name: oss/gitlab.security-code-scan.SCS0005-1
rubric: safety
severity: should_fix
languages: [csharp]
---

**Rule.** Depending on the context, generating weak random numbers may expose cryptographic functions which rely on these numbers to be exploitable. When generating numbers for sensitive values such as tokens, nonces, and cryptographic keys, it is recommended that the `RandomNumberGenerator` class be used. Example `RandomNumberGenerator` usage: ``` Int32 randInt = RandomNumberGenerator.GetInt32(32000); byte[] randomBytes = new byte[64]; RandomNumberGenerator.Fill(randomBytes); Console.WriteLine("Random Int32: {0}", randInt); Console.WriteLine("Random Bytes: {0}", BitConverter.ToString(randomBytes).Replace("-", "")); ``` For more information see: https://learn.microsoft.com/en-us/dotnet/api/system.security.cryptography.randomnumbergenerator

**Why.** Reported as CWE-338. Ported from opengrep rule `gitlab.security_code_scan.SCS0005-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
(Random $RNG).$METHOD(...);
```

## Detection hints

Literal patterns from opengrep rule `gitlab.security_code_scan.SCS0005-1` (metavariables start with `$`):

- `(Random $RNG).$METHOD(...);`
