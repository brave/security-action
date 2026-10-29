---
name: oss/gitlab.find-sec-bugs.INSECURE-SMTP-SSL-1
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** The Apache commons mail client by default does not enable TLS server identity. This allows for an adversary who is in between the application and the target host to intercept potentially sensitive information or transmit malicious data. Enable checking server identity by calling `Email.setSSLCheckServerIdentity(true)` Example email client that enables TLS and server identity: ``` // Create an email client Email email = new SimpleEmail(); // Configure the email hostname email.setHostName("smtp.mail.example.com"); // Set the port email.setSmtpPort(465); // Securely retrieve username and password values String username = getUserNameFromKMSorSecretStore(); String password = getPasswordFromKMSorSecretStore(); // Configure the Authenticator DefaultAuthenticator auth = new DefaultAuthenticator(username, password); // Set the authenticator email.setAuthenticator(auth); // Ensure we use SSL on connect email.setSSLOnConnect(true); // Ensure we validate server identity email.setSSLCheckServerIdentity(true); // configure the rest of the email email.setFrom("x@example.com"); email.setSubject("TestMail"); email.setMsg("This is a test mail ... :-)"); email.addTo("y@example.com"); email.send(); ```

**Why.** Reported as CWE-297. Ported from opengrep rule `gitlab.find_sec_bugs.INSECURE_SMTP_SSL-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// no static pattern; see Detection hints
```

Good:

```java
$E.setSSLOnConnect(true);
...
$E.setSSLCheckServerIdentity(true);
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.INSECURE_SMTP_SSL-1` (metavariables start with `$`):

- `$E = new org.apache.commons.mail.SimpleEmail(...);
...`
- `$E = new org.apache.commons.mail.Email(...);
...`
- `$E = new org.apache.commons.mail.MultiPartEmail(...);
...`
- `$E = new org.apache.commons.mail.HtmlEmail(...);
...`
- `$E = new org.apache.commons.mail.ImageHtmlEmail(...);
...`
- `$E.setSSLOnConnect(true);
...
$E.setSSLCheckServerIdentity(true);`
