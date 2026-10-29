---
name: oss/gitlab.find-sec-bugs.HARD-CODE-PASSWORD-1
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** A potential hard-coded password was identified in a hard-coded string. Passwords should not be stored directly in code but loaded from secure locations such as a Key Management System (KMS). The purpose of using a Key Management System is so access can be audited and keys easily rotated in the event of a breach. By hardcoding passwords, it will be extremely difficult to determine when or if, a key is compromised. The recommendation on which KMS to use depends on the environment the application is running in: - For Google Cloud Platform consider [Cloud Key Management](https://cloud.google.com/kms/docs) - For Amazon Web Services consider [AWS Key Management](https://aws.amazon.com/kms/) - For on premise or other alternatives to cloud providers, consider [Hashicorp's Vault](https://www.vaultproject.io/) - For other cloud providers, please see their documentation

**Why.** Reported as CWE-259. Ported from opengrep rule `gitlab.find_sec_bugs.HARD_CODE_PASSWORD-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.HARD_CODE_PASSWORD-1` (metavariables start with `$`):

- `new java.security.KeyStore.PasswordProtection("...".toCharArray())`
- `java.security.KeyStore.getInstance(...).load(..., "...".toCharArray())`
- `(java.security.KeyStore $KS).load(..., "...".toCharArray())`
- `KeyManagerFactory.getInstance(...).init(..., "...".toCharArray())`
- `(KeyManagerFactory $KMF).init(..., "...".toCharArray())`
- `PBEKeySpec("...", ...)`
- `PasswordAuthentication("...", "...")`
- `(PasswordCallback $CB).setPassword("...")`
- `KerberosKey(...,"...",...)`
- `java.sql.DriverManager.getConnection(..., "...")`
- `io.vertx.ext.web.handler.CSRFHandler.create(..., "...")`
- `$S.setPassword("...")`
