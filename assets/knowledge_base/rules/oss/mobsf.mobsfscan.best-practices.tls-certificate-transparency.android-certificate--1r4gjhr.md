---
name: oss/mobsf.mobsfscan.best-practices.tls-certificate-transparency.android-certificate--1r4gjhr
rubric: correctness
severity: nit
languages: [java]
---

**Rule.** This app does not enforce TLS Certificate Transparency that helps to detect SSL certificates that have been mistakenly issued by a certificate authority or maliciously acquired from an otherwise unimpeachable certificate authority.

**Why.** Reported as cwe-295. Ported from opengrep rule `mobsf.mobsfscan.best_practices.tls_certificate_transparency.android_certificate_transparency` (generated/oss/others.yaml).

## Examples

Bad:

```java
import com.babylon.certificatetransparency;
new CTInterceptorBuilder(...)
new CTHostnameVerifierBuilder(...)
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.best_practices.tls_certificate_transparency.android_certificate_transparency` (metavariables start with `$`):

- `import com.babylon.certificatetransparency;`
- `new CTInterceptorBuilder(...)`
- `new CTHostnameVerifierBuilder(...)`
