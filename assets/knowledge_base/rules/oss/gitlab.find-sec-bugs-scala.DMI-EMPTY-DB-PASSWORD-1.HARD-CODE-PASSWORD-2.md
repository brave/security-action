---
name: oss/gitlab.find-sec-bugs-scala.DMI-EMPTY-DB-PASSWORD-1.HARD-CODE-PASSWORD-2
rubric: safety
severity: should_fix
languages: [scala]
---

**Rule.** The application does not provide authentication when communicating a database server. It is strongly recommended that the database server be configured with authentication and restrict what queries users can execute. Please see your database server's documentation on how to configure a password. Additionally, passwords should not be stored directly in code but loaded from secure locations such as a Key Management System (KMS). The purpose of using a Key Management System is so access can be audited and keys easily rotated in the event of a breach. By hardcoding passwords, it will be extremely difficult to determine when or if, a key is compromised. The recommendation on which KMS to use depends on the environment the application is running in: - For Google Cloud Platform consider [Cloud Key Management](https://cloud.google.com/kms/docs) - For Amazon Web Services consider [AWS Key Management](https://aws.amazon.com/kms/) - For on premise or other alternatives to cloud providers, consider [Hashicorp's Vault](https://www.vaultproject.io/) - For other cloud providers, please see their documentation

**Why.** Reported as CWE-259. Ported from opengrep rule `gitlab.find_sec_bugs_scala.DMI_EMPTY_DB_PASSWORD-1.HARD_CODE_PASSWORD-2` (generated/oss/audit.yaml).

## Examples

Bad:

```text
java.sql.DriverManager.getConnection($URI, $USR, "");
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.DMI_EMPTY_DB_PASSWORD-1.HARD_CODE_PASSWORD-2` (metavariables start with `$`):

- `java.sql.DriverManager.getConnection($URI, $USR, "");`
