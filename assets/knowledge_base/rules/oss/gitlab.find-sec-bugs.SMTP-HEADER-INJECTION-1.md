---
name: oss/gitlab.find-sec-bugs.SMTP-HEADER-INJECTION-1
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** The application was found calling `MimeMessage` methods without encoding new line characters. Much like HTTP, Simple Mail Transfer Protocol (SMTP) is a text based protocol that uses headers to convey additional directives for how email messages should be treated. An adversary could potentially cause email messages to be sent to unintended recipients by abusing the CC or BCC headers if they were able to inject them. To mitigate this issue, `\r\n` (CRLF) character sequences must be escaped or encoded prior to being used in any of the `MimeMessage` methods. Example that escapes values that come from user input with [Apache Commons Text](https://commons.apache.org/proper/commons-text/): ``` // Create a MimeMessage with a javax.mail.Session Message message = new MimeMessage(session); // Set the from address message.setFrom(new InternetAddress("source@example.com")); // Set the to address message.setRecipients(Message.RecipientType.TO,new InternetAddress[] {new InternetAddress("destination@example.com")}); // Example user input String subject = "potentially malicious data"; String headerValue = "potentially malicious data"; // Use Apache Commons Text StringEscapeUtils.escapeJava to encode \r\n to \\r\\n. message.setSubject(StringEscapeUtils.escapeJava(subject)); // Use Apache Commons Text StringEscapeUtils.escapeJava to encode \r\n to \\r\\n. message.addHeader("HeaderName", StringEscapeUtils.escapeJava(header)); // Use Apache Commons Text StringEscapeUtils.escapeJava to encode \r\n to \\r\\n. message.setDescription(StringEscapeUtils.escapeJava("some description")); // Use Apache Commons Text StringEscapeUtils.escapeJava to encode \r\n to \\r\\n. message.setDisposition(StringEscapeUtils.escapeJava("some disposition")); // Set the mail body text message.setText("Some email content."); // Send the message ```

**Why.** Reported as CWE-77. Ported from opengrep rule `gitlab.find_sec_bugs.SMTP_HEADER_INJECTION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
$M.setSubject($VAR)
$M.addHeader($ARG, $VAR)
$M.addHeader($VAR, $ARG)
$M.setDescription($VAR)
$M.setDisposition($VAR)
$M.setSubject($OBJ.$GETTER(...))
$M.setSubject($OBJ.$GETTER(...) + ...)
$M.setSubject(... + $OBJ.$GETTER(...))
$M.setSubject(... + $OBJ.$GETTER(...) + ...)
$M.addHeader($ARG, $OBJ.$GETTER(...))
$M.addHeader($ARG, $OBJ.$GETTER(...) + ...)
$M.addHeader($ARG, ... + $OBJ.$GETTER(...))
$M.addHeader($ARG, ... + $OBJ.$GETTER(...) + ...)
$M.addHeader($OBJ.$GETTER(...), $ARG)
$M.addHeader($OBJ.$GETTER(...) + ..., $ARG)
$M.addHeader(... + $OBJ.$GETTER(...), $ARG)
$M.addHeader(... + $OBJ.$GETTER(...) + ..., $ARG)
$M.setDescription($OBJ.$GETTER(...))
$M.setDisposition($OBJ.$GETTER(...) + ...)
$M.setDisposition(... + $OBJ.$GETTER(...))
$M.setDisposition(... + $OBJ.$GETTER(...) + ...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.SMTP_HEADER_INJECTION-1` (metavariables start with `$`):

- `$M = new MimeMessage(...);
...`
- `$M.setSubject($VAR)`
- `$M.addHeader($ARG, $VAR)`
- `$M.addHeader($VAR, $ARG)`
- `$M.setDescription($VAR)`
- `$M.setDisposition($VAR)`
- `^[a-zA-Z_$][a-zA-Z0-9_$]*$`
- `$M.setSubject($OBJ.$GETTER(...))`
- `$M.setSubject($OBJ.$GETTER(...) + ...)`
- `$M.setSubject(... + $OBJ.$GETTER(...))`
- `$M.setSubject(... + $OBJ.$GETTER(...) + ...)`
- `$M.addHeader($ARG, $OBJ.$GETTER(...))`
- `$M.addHeader($ARG, $OBJ.$GETTER(...) + ...)`
- `$M.addHeader($ARG, ... + $OBJ.$GETTER(...))`
- `$M.addHeader($ARG, ... + $OBJ.$GETTER(...) + ...)`
- `$M.addHeader($OBJ.$GETTER(...), $ARG)`
- `$M.addHeader($OBJ.$GETTER(...) + ..., $ARG)`
- `$M.addHeader(... + $OBJ.$GETTER(...), $ARG)`
- `$M.addHeader(... + $OBJ.$GETTER(...) + ..., $ARG)`
- `$M.setDescription($OBJ.$GETTER(...))`
- `$M.setDisposition($OBJ.$GETTER(...) + ...)`
- `$M.setDisposition(... + $OBJ.$GETTER(...))`
- `$M.setDisposition(... + $OBJ.$GETTER(...) + ...)`
- `^get`
