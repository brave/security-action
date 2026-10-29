---
name: oss/gitlab.find-sec-bugs.WEAK-TRUST-MANAGER
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** The `X509TrustManager` has been configured to return null. This effectively disables the validation of server or client certificates. This could allow an adversary who is in between the application and the target host to launch a Man in the middle attack (MITM) i.e intercept potentially sensitive information or inject malicious content into the communication stream. Consider using the default `TrustManager` instead of implementing a custom one. If you must override the default verification process, implement proper TrustManager verification for `checkServerTrusted` and `checkClientTrusted` by throwing `CertificateException` if the certificate is invalid. For most applications, using the default TrustManager provided by the Java runtime is sufficient and recommended. Following is an example using the built in `TrustManagerFactory` to manage validating certificate chains: ``` // Use the default TrustManagerFactory TrustManagerFactory trustManagerFactory = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm()); // Use default system KeyStore, alternatively pass in your own keystore. trustManagerFactory.init((KeyStore) null); // Create SSLContext for TLS connections SSLContext tlsContext = SSLContext.getInstance("TLS"); // Initialize the tlsContext with our trust manager and a SecureRandom number generator. tlsContext.init(null, trustManagerFactory.getTrustManagers(), new SecureRandom()); ``` For more information on TLS security, refer the following OWASP documentation: https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Protection_Cheat_Sheet.html

**Why.** Reported as CWE-295. Ported from opengrep rule `gitlab.find_sec_bugs.WEAK_TRUST_MANAGER` (generated/oss/audit.yaml).

## Examples

Bad:

```java
public void checkClientTrusted(...) {}
public void checkServerTrusted(...) {}
X509Certificate[] getAcceptedIssuers() {
  ...
  return null;
  ...
}
```

Good:

```java
X509Certificate[] getAcceptedIssuers() {
    ...
    return $VAR;
    ...
  }
^((?!null).)*$
X509Certificate[] getAcceptedIssuers() {
    $VAR = null;
    ...
    return $VAR;
    ...
  }
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.WEAK_TRUST_MANAGER` (metavariables start with `$`):

- `class $V implements X509TrustManager {
  ...
}`
- `public void checkClientTrusted(...) {}`
- `public void checkServerTrusted(...) {}`
- `X509Certificate[] getAcceptedIssuers() {
  ...
  return null;
  ...
}`
- `X509Certificate[] getAcceptedIssuers() {
    ...
    return $VAR;
    ...
  }`
- `^((?!null).)*$`
- `X509Certificate[] getAcceptedIssuers() {
    $VAR = null;
    ...
    return $VAR;
    ...
  }`
