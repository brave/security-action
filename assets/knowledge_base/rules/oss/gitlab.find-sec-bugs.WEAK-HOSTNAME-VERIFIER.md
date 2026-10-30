---
name: oss/gitlab.find-sec-bugs.WEAK-HOSTNAME-VERIFIER
rubric: safety
severity: should_fix
languages: [java]
cwe: [CWE-295]
---

**Rule.** The `HostnameVerifier` has been set to always return `true`. This effectively disables the validation of server or client certificates. This could allow an adversary who is in between the application and the target host to launch a Man in the middle attack (MITM) i.e intercept potentially sensitive information or inject malicious content into the communication stream. To mitigate this vulnerability and enhance the security of your application, it is strongly advised to adhere to the default HostnameVerifier settings. This ensures that the validation mechanism remains intact, providing a crucial layer of security against unauthorized interception and data manipulation. Implementing the default HostnameVerifier can be achieved with the following code snippet: ``` // Use the default HostnameVerifier HttpsURLConnection connection = (HttpsURLConnection) url.openConnection(); connection.setHostnameVerifier(HttpsURLConnection.getDefaultHostnameVerifier()); ``` For more information on TLS security, refer the following OWASP documentation: https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Protection_Cheat_Sheet.html

**Why.** Reported as CWE-295. Ported from opengrep rule `gitlab.find_sec_bugs.WEAK_HOSTNAME_VERIFIER` (generated/oss/audit.yaml).

## Examples

Bad:

```java
boolean verify(...) {
  ...
  return true;
  ...
}
```

Good:

```java
boolean verify(...) {
    ...
    return $VAR;
    ...
  }
^((?!true).)*$
boolean verify(...) {
    $VAR = true;
    ...
    return $VAR;
    ...
  }
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.WEAK_HOSTNAME_VERIFIER` (metavariables start with `$`):

- `class $V implements HostnameVerifier {
  ...
}`
- `boolean verify(...) {
  ...
  return true;
  ...
}`
- `boolean verify(...) {
    ...
    return $VAR;
    ...
  }`
- `^((?!true).)*$`
- `boolean verify(...) {
    $VAR = true;
    ...
    return $VAR;
    ...
  }`
