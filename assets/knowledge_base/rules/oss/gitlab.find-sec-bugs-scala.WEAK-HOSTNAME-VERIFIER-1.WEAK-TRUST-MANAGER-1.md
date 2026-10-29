---
name: oss/gitlab.find-sec-bugs-scala.WEAK-HOSTNAME-VERIFIER-1.WEAK-TRUST-MANAGER-1
rubric: safety
severity: should_fix
languages: [scala]
---

**Rule.** A HostnameVerifier that accept any host are often use because of certificate reuse on many hosts. As a consequence, this is vulnerable to Man-in-the-middle attacks since the client will trust any certificate.

**Why.** Reported as CWE-295. Ported from opengrep rule `gitlab.find_sec_bugs_scala.WEAK_HOSTNAME_VERIFIER-1.WEAK_TRUST_MANAGER-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
def verify(...) = true
def verify(...) = {
  return true
}
def checkClientTrusted(...): Unit = {}
def checkServerTrusted(...): Unit = {}
def checkClientTrusted(...) = {}
def checkServerTrusted(...) = {}
def getAcceptedIssuers(): Array[X509Certificate] = null
def getAcceptedIssuers(): Array[X509Certificate] = {}
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.WEAK_HOSTNAME_VERIFIER-1.WEAK_TRUST_MANAGER-1` (metavariables start with `$`):

- `class $V extends HostnameVerifier {
  ...
}`
- `def verify(...) = true`
- `def verify(...) = {
  return true
}`
- `class $V extends X509TrustManager {
  ...
}`
- `def checkClientTrusted(...): Unit = {}`
- `def checkServerTrusted(...): Unit = {}`
- `def checkClientTrusted(...) = {}`
- `def checkServerTrusted(...) = {}`
- `def getAcceptedIssuers(): Array[X509Certificate] = null`
- `def getAcceptedIssuers(): Array[X509Certificate] = {}`
