---
name: oss/mobsf.mobsfscan.network.accept-self-signed.accept-self-signed-certificate
rubric: correctness
severity: should_fix
languages: [java]
---

**Rule.** Insecure Implementation of SSL. Trusting all the certificates or accepting self signed certificates is a critical Security Hole. This application is vulnerable to MITM attacks.

**Why.** Reported as cwe-295. Ported from opengrep rule `mobsf.mobsfscan.network.accept_self_signed.accept_self_signed_certificate` (generated/oss/others.yaml).

## Examples

Bad:

```java
$X.SSLSocketFactory.ALLOW_ALL_HOSTNAME_VERIFIER
$X.setHostnameVerifier($Z.ALLOW_ALL_HOSTNAME_VERIFIER);
$X.setHostnameVerifier(new AllowAllHostnameVerifier());
$X.setDefaultHostnameVerifier(new NullHostnameVerifier());
$X.setDefaultHostnameVerifier((HostnameVerifier) new NullHostnameVerifier());
$RET verify(..., SSLSession $X) {
  ...
  return true;
}
$Y = SSLContext.getInstance(...);
...
$Y.init(null, ...);
$Y = $S.SSLContext.getInstance(...);
...
$Y.init(null, ...);
$Z = new TLSClientParameters(...);
...
$Z.setDisableCNCheck(true);
X509Certificate[] getAcceptedIssuers() { 
  ...
  return new X509Certificate[]{};
}
X509Certificate[] getAcceptedIssuers() {
  ...
  return new java.security.cert.X509Certificate[]{};
}
X509Certificate[] getAcceptedIssuers() { 
  ...
  $Y = new X509Certificate[]{};
  ...
  return $Y;
}
X509Certificate[] getAcceptedIssuers() {
  return new X509Certificate[0];
}
X509Certificate[] getAcceptedIssuers() {
  ...
  $X =  new X509Certificate[0];
  ...
  return $X;
}
X509Certificate[] getAcceptedIssuers() {
  return null;
}
sslContext.init(null, ...);
setSslSocketFactory(new NonValidatingSSLSocketFactory());
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.network.accept_self_signed.accept_self_signed_certificate` (metavariables start with `$`):

- `$X.SSLSocketFactory.ALLOW_ALL_HOSTNAME_VERIFIER`
- `$X.setHostnameVerifier($Z.ALLOW_ALL_HOSTNAME_VERIFIER);`
- `$X.setHostnameVerifier(new AllowAllHostnameVerifier());`
- `$X.setDefaultHostnameVerifier(new NullHostnameVerifier());`
- `$X.setDefaultHostnameVerifier((HostnameVerifier) new NullHostnameVerifier());`
- `$RET verify(..., SSLSession $X) {
  ...
  return true;
}`
- `$Y = SSLContext.getInstance(...);
...
$Y.init(null, ...);`
- `$Y = $S.SSLContext.getInstance(...);
...
$Y.init(null, ...);`
- `$Z = new TLSClientParameters(...);
...
$Z.setDisableCNCheck(true);`
- `X509Certificate[] getAcceptedIssuers() { 
  ...
  return new X509Certificate[]{};
}`
- `X509Certificate[] getAcceptedIssuers() {
  ...
  return new java.security.cert.X509Certificate[]{};
}`
- `X509Certificate[] getAcceptedIssuers() { 
  ...
  $Y = new X509Certificate[]{};
  ...
  return $Y;
}`
- `X509Certificate[] getAcceptedIssuers() {
  return new X509Certificate[0];
}`
- `X509Certificate[] getAcceptedIssuers() {
  ...
  $X =  new X509Certificate[0];
  ...
  return $X;
}`
- `X509Certificate[] getAcceptedIssuers() {
  return null;
}`
- `sslContext.init(null, ...);`
- `setSslSocketFactory(new NonValidatingSSLSocketFactory());`
