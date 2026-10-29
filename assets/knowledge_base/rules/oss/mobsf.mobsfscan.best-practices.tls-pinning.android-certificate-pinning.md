---
name: oss/mobsf.mobsfscan.best-practices.tls-pinning.android-certificate-pinning
rubric: correctness
severity: nit
languages: [java]
---

**Rule.** This app does not use a TLS/SSL certificate or public key pinning in code to detect or prevent MITM attacks in secure communication channel. Please verify if pinning is enabled in `network_security_config.xml`.

**Why.** Reported as cwe-295. Ported from opengrep rule `mobsf.mobsfscan.best_practices.tls_pinning.android_certificate_pinning` (generated/oss/others.yaml).

## Examples

Bad:

```java
import com.toyberman.RNSslPinningPackage;
import org.thoughtcrime.ssl.pinning;
new PinningValidationReportTestBroadcastReceiver()
new CertificatePinner.Builder()
CertificatePinner.Builder()
TrustKit.getInstance().getSSLSocketFactory(...)
$X = $R.openRawResource(...);
...
$KS = KeyStore.getInstance(...);
...
$KS.load($X, ...);
...
$T.init($KS);
TrustKit.initializeWithNetworkSecurityConfiguration(...);
OkHttp2Helper.getPinningInterceptor()
OkHttp3Helper.getPinningInterceptor()
new PinningHostnameVerifier(...)
PinningHelper.getPinnedHttpsURLConnection
$F.openRawResource(...);
...
$X = new Picasso.Builder(...);
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.best_practices.tls_pinning.android_certificate_pinning` (metavariables start with `$`):

- `import com.toyberman.RNSslPinningPackage;`
- `import org.thoughtcrime.ssl.pinning;`
- `new PinningValidationReportTestBroadcastReceiver()`
- `new CertificatePinner.Builder()`
- `CertificatePinner.Builder()`
- `TrustKit.getInstance().getSSLSocketFactory(...)`
- `$X = $R.openRawResource(...);
...
$KS = KeyStore.getInstance(...);
...
$KS.load($X, ...);
...
$T.init($KS);`
- `TrustKit.initializeWithNetworkSecurityConfiguration(...);`
- `OkHttp2Helper.getPinningInterceptor()`
- `OkHttp3Helper.getPinningInterceptor()`
- `new PinningHostnameVerifier(...)`
- `PinningHelper.getPinnedHttpsURLConnection`
- `$F.openRawResource(...);
...
$X = new Picasso.Builder(...);`
