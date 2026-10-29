---
name: oss/mobsf.mobsfscan.webview.webview-ignore-ssl-errors.ignore-ssl-certificate-errors
rubric: correctness
severity: should_fix
languages: [java]
cwe: [cwe-295]
---

**Rule.** Insecure WebView Implementation. WebView ignores SSL Certificate errors and accept any SSL Certificate. This application is vulnerable to MITM attacks.

**Why.** Reported as cwe-295. Ported from opengrep rule `mobsf.mobsfscan.webview.webview_ignore_ssl_errors.ignore_ssl_certificate_errors` (generated/oss/others.yaml).

## Examples

Bad:

```java
$RET onReceivedSslError(WebView $W, SslErrorHandler $H, SslError $E) {
  ...
  $H.proceed();
}
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.webview.webview_ignore_ssl_errors.ignore_ssl_certificate_errors` (metavariables start with `$`):

- `$RET onReceivedSslError(WebView $W, SslErrorHandler $H, SslError $E) {
  ...
  $H.proceed();
}`
