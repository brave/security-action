---
name: oss/gitlab.find-sec-bugs-scala.HARD-CODE-PASSWORD-1
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-259]
---

**Rule.** A potential hard-coded password was identified in the source code. Passwords should not be stored directly in code but loaded from secure locations such as a Key Management System (KMS). The purpose of using a Key Management System is so access can be audited and keys easily rotated in the event of a breach. By hardcoding passwords, it will be extremely difficult to determine when or if, a key is compromised. The recommendation on which KMS to use depends on the environment the application is running in: - For Google Cloud Platform consider [Cloud Key Management](https://cloud.google.com/kms/docs) - For Amazon Web Services consider [AWS Key Management](https://aws.amazon.com/kms/) - For on premise or other alternatives to cloud providers, consider [Hashicorp's Vault](https://www.vaultproject.io/) - For other cloud providers, please see their documentation

**Why.** Reported as CWE-259. Ported from opengrep rule `gitlab.find_sec_bugs_scala.HARD_CODE_PASSWORD-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.HARD_CODE_PASSWORD-1` (metavariables start with `$`):

- `java.security.KeyStore.PasswordProtection("...".toCharArray())`
- `java.security.KeyStore.getInstance(...).load(..., "...".toCharArray())`
- `($KS: java.security.KeyStore).load(..., "...".toCharArray())`
- `KeyManagerFactory.getInstance(...).init(..., "...".toCharArray())`
- `($KMF: KeyManagerFactory).init(..., "...".toCharArray())`
- `PBEKeySpec("...", ...)`
- `PasswordAuthentication("...", "...")`
- `($CB: PasswordCallback).setPassword("...")`
- `KerberosKey(...,"...",...)`
- `java.sql.DriverManager.getConnection(..., "...")`
- `io.vertx.ext.web.handler.CSRFHandler.create(..., "...")`
- `$S.setPassword("...")`
