---
name: oss/gitlab.find-sec-bugs-kotlin.WEAK-HOSTNAME-VERIFIER-1.WEAK-TRUST-MANAGER-1
rubric: safety
severity: should_fix
languages: [kotlin]
cwe: [CWE-295]
---

**Rule.** A HostnameVerifier that accept any host are often use because of certificate reuse on many hosts. As a consequence, this is vulnerable to Man-in-the-middle attacks since the client will trust any certificate.

**Why.** Reported as CWE-295. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.WEAK_HOSTNAME_VERIFIER-1.WEAK_TRUST_MANAGER-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
fun verify(...): Boolean {
  return true
}
fun checkClientTrusted(...) {}
fun checkServerTrusted(...) {}
fun getAcceptedIssuers(): Array<X509Certificate>? {return null}
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.WEAK_HOSTNAME_VERIFIER-1.WEAK_TRUST_MANAGER-1` (metavariables start with `$`):

- `class $V : HostnameVerifier {
  ...
}`
- `fun verify(...): Boolean {
  return true
}`
- `class $V : X509TrustManager {
  ...
}`
- `fun checkClientTrusted(...) {}`
- `fun checkServerTrusted(...) {}`
- `fun getAcceptedIssuers(): Array<X509Certificate>? {return null}`
