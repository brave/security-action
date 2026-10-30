---
name: oss/gitlab.find-sec-bugs-kotlin.SSL-CONTEXT-2
rubric: safety
severity: should_fix
languages: [kotlin]
cwe: [CWE-326]
---

**Rule.** The application was found enabling insecure TLS protocol versions. When enabling protocol versions for an `SSLContext`, only the following versions should be allowed: - TLSv1.2 - TLSv1.3 - DTLSv1.2 - DTLSv1.3 To mitigate potential security risks, it is strongly advised to enforce TLS 1.2 as the minimum protocol version and disallow older versions such as TLS 1.0. Do note that newer versions of Java do not even support TLS 1.0 and will throw `NoSuchAlgorithmException`. Versions of TLS prior to 1.2 could expose the connection to downgrade attacks, where an adversary intercepts the connection and alters the requested protocol version to be a less secure one. In many scenarios, relying on the default system configuration does not meet compliance standards. This is due to the application being deployed across diverse systems with varying configurations and Java versions. While the default value may be secure on modern and up-to-date systems, it may not hold true for older systems. Consequently, it is highly recommended to explicitly define a secure configuration in all cases. Example configuring an SSLContext with TLSv1.2: ``` // Create an SSLContext with TLSv1.2 explicitly SSLContext tlsContext = SSLContext.getInstance("TLSv1.2"); // or TLSv1.3, DTLSv1.2, DTLSv1.3 // Alternatively, set the enabled protocols SSLContext serverSslContext = SSLContext.getInstance("TLS"); SSLEngine serverEngine = serverSslContext.createSSLEngine(); // Calling setEnabledProtocols will override the original context's configured protocol version serverEngine.setEnabledProtocols(new String[]{ "TLSv1.2" }); ``` For more information on `SSLContext` see: - https://docs.oracle.com/en/java/javase/11/docs/api/java.base/javax/net/ssl/SSLContext.html For more information on MiTM attacks see: - https://owasp.org/www-community/attacks/Manipulator-in-the-middle_attack

**Why.** Reported as CWE-326. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.SSL_CONTEXT-2` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

Good:

```text
$C = SSLContext.getInstance(...);
...
$ENGINE.setEnabledProtocols(arrayOf(...,"$DT_GOODNESS",...));
^D?TLSv1\.[23]$
$C = SSLContext.getInstance(...);
...
$E = $C.createSSLEngine()
...
$E.enabledProtocols = arrayOf(...,"$DT_GOODNESS",...)
^DTLSv1\.[23]$
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.SSL_CONTEXT-2` (metavariables start with `$`):

- `import javax.net.ssl.*;
...`
- `import javax.net.ssl.SSLContext;
...`
- `SSLContext.getInstance("$UNSAFE_VERSION");`
- `SSLContext.getInstance(...);
...
$ENGINE.setEnabledProtocols(arrayOf(...,"$UNSAFE_VERSION",...));`
- `$C = SSLContext.getInstance(...);
...
$ENGINE.setEnabledProtocols(arrayOf(...,"$DT_GOODNESS",...));`
- `^D?TLSv1\.[23]$`
- `$C = SSLContext.getInstance(...);
...
$E = $C.createSSLEngine()
...
$E.enabledProtocols = arrayOf(...,"$DT_GOODNESS",...)`
- `^DTLSv1\.[23]$`
- `^(TLS|(D)?TLSv1.(0|1))$`
