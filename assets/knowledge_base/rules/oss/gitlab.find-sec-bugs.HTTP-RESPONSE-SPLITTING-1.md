---
name: oss/gitlab.find-sec-bugs.HTTP-RESPONSE-SPLITTING-1
rubric: safety
severity: should_fix
languages: [java]
cwe: [CWE-113]
---

**Rule.** HTTP Response Splitting is a vulnerability where Carriage Return (CR `\r`) and Line Feed (LF `\n`) characters are introduced into an HTTP header from user-supplied input. By injecting the `\r\n` character sequence, an adversary could potentially modify how the response is interpreted by the client or any downstream caching services. This could allow an adversary to poison the cache data or execute Cross-Site Scripting (XSS) attacks. Some Java application servers such as [Apache Tomcat](https://tomcat.apache.org/) as of version 8.0, newer versions of Jetty and other servers that implement the [RFC 6265 Standard](https://datatracker.ietf.org/doc/html/rfc6265) will disallow `\r' and '\n` characters characters from being set in cookies. If your application server does not automatically provide this functionality, user-supplied input that is used in cookie keys or values must be validated. Example of validating cookies to only allow valid characters: ``` // throws an IllegalArgumentException if the provided value contains invalid characters public void validateRfc6265CookieValue(String value) throws IllegalArgumentException { char[] chars = value.toCharArray(); // iterate over every character for (int i = 0; i < chars.length; i++) { char c = chars[i]; // check for any characters below 0x21 as well as: '"' ',' ';' '\' and 0x7f. if (c < 0x21 || c == '"' || c == ',' || c == ';' || c == '\\' || c == 0x7f) { throw new IllegalArgumentException("Invalid character in cookie detected: {0}".format(Integer.toString(c))); } } } ``` Alternatively, you could use a string escape package such as [Apache Commons Text](https://commons.apache.org/proper/commons-text/) to escape the input: ``` public String escapeValue(String value) { return StringEscapeUtils.escapeJava(value); } ``` For more information on response splitting attacks see OWASP: https://owasp.org/www-community/attacks/HTTP_Response_Splitting

**Why.** Reported as CWE-113. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs.HTTP_RESPONSE_SPLITTING-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// untrusted input (source)
(javax.servlet.http.HttpServletRequest $REQ).getParameter(...);
(javax.servlet.http.HttpServletRequest $REQ).getParameterNames();
(javax.servlet.http.HttpServletRequest $REQ).getParameterValues(...);
(javax.servlet.http.HttpServletRequest $REQ).getParameterMap();
(javax.servlet.http.HttpServletRequest $REQ).getHeader(...);
(javax.servlet.http.HttpServletRequest $REQ).getPathInfo();
// flows to sink without sanitization
new javax.servlet.http.Cookie("$KEY", ...);
$C.setValue(...);
```

Good:

```java
$STR
org.apache.commons.text.StringEscapeUtils.escapeJava($STR);
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.HTTP_RESPONSE_SPLITTING-1` (metavariables start with `$`):

- `$STR.replaceAll($REPLACER, "...");
...`
- `$STR`
- `.*\[(?=.*\\r)(?=.*\\n).*\]\+`
- `org.apache.commons.text.StringEscapeUtils.escapeJava($STR);`
- `new javax.servlet.http.Cookie("$KEY", ...);`
- `$C = new javax.servlet.http.Cookie("$KEY", ...);
...`
- `$C.setValue(...);`
- `(javax.servlet.http.HttpServletRequest $REQ).getParameter(...);`
- `(javax.servlet.http.HttpServletRequest $REQ).getParameterNames();`
- `(javax.servlet.http.HttpServletRequest $REQ).getParameterValues(...);`
- `(javax.servlet.http.HttpServletRequest $REQ).getParameterMap();`
- `(javax.servlet.http.HttpServletRequest $REQ).getHeader(...);`
- `(javax.servlet.http.HttpServletRequest $REQ).getPathInfo();`
