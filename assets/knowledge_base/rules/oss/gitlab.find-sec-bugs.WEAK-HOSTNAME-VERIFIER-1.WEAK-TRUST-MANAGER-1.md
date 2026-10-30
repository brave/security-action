---
name: oss/gitlab.find-sec-bugs.WEAK-HOSTNAME-VERIFIER-1.WEAK-TRUST-MANAGER-1
rubric: safety
severity: should_fix
languages: [java]
cwe: [CWE-295]
---

**Rule.** Either the `HostnameVerifier` has been set to always return `true` or the `X509TrustManager` has been configured to return null, or both. This effectively disables the validation of server or client certificates. This allows for an adversary who is in between the application and the target host to intercept potentially sensitive information or transmit malicious data. It is recommended to not override the default `HostnameVerifiers`. Consider using the default `TrustManager` instead of implementing a custom one. If you must override the default verification process, implement proper TrustManager verification for `checkServerTrusted` and `checkClientTrusted` by throwing `CertificateException` if the certificate is invalid. Example using the built in `TrustManagerFactory` to manage validating certificate chains: ``` // Use the default TrustManagerFactory TrustManagerFactory trustManagerFactory = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm()); // Use default system KeyStore, alternatively pass in your own keystore. trustManagerFactory.init((KeyStore) null); // Create SSLContext for TLS connections SSLContext tlsContext = SSLContext.getInstance("TLS"); // Initialize the tlsContext with our trust manager and a SecureRandom number generator. tlsContext.init(null, trustManagerFactory.getTrustManagers(), new SecureRandom()); ``` For more information on TLS security see OWASP: https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Protection_Cheat_Sheet.html

**Why.** Reported as CWE-295. Ported from opengrep rule `gitlab.find_sec_bugs.WEAK_HOSTNAME_VERIFIER-1.WEAK_TRUST_MANAGER-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
return true;
public void checkClientTrusted(...) {}
public void checkServerTrusted(...) {}
public X509Certificate[] getAcceptedIssuers() {
  ...
  return null;
}
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.WEAK_HOSTNAME_VERIFIER-1.WEAK_TRUST_MANAGER-1` (metavariables start with `$`):

- `class $V implements HostnameVerifier {
  ...
}`
- `public boolean verify(...) {
  ...
}`
- `return true;`
- `class $V implements X509TrustManager {
  ...
}`
- `public void checkClientTrusted(...) {}`
- `public void checkServerTrusted(...) {}`
- `public X509Certificate[] getAcceptedIssuers() {
  ...
  return null;
}`
