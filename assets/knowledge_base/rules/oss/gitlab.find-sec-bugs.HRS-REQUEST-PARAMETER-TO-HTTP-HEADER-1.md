---
name: oss/gitlab.find-sec-bugs.HRS-REQUEST-PARAMETER-TO-HTTP-HEADER-1
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** HTTP Response Splitting is a vulnerability where Carriage Return (CR `\r`) and Line Feed (LF `\n`) characters are introduced into an HTTP header from user-supplied input. By injecting the `\r\n` character sequence, an adversary could potentially modify how the response is interpreted by the client or any down stream caching services. This could allow an adversary to poison the cache data or execute Cross-Site Scripting (XSS) attacks. Some Java application servers such as [Apache Tomcat](https://tomcat.apache.org/) will automatically encode characters from being set in response headers as a space `0x20` character. If your application server does not automatically provide this functionality, user-supplied input that is used in header keys or values must be validated. Example of validating headers to only allow valid characters: ``` // throws an IllegalArgumentException if the provided value contains invalid characters public void validateHeader(String value) throws IllegalArgumentException { char[] chars = value.toCharArray(); // iterate over every character for (int i = 0; i < chars.length; i++) { char c = chars[i]; // check for any characters below 0x21 as well as: '"' ',' ';' '\' and 0x7f. if (c < 0x21 || c == '"' || c == ',' || c == ';' || c == '\\' || c == 0x7f) { throw new IllegalArgumentException("Invalid character in cookie detected: {0}".format(Integer.toString(c))); } } } ``` Alternatively, you could use a string escape package such as [Apache Commons Text](https://commons.apache.org/proper/commons-text/) to escape the input: ``` public String escapeValue(String value) { return StringEscapeUtils.escapeJava(value); } ``` For more information on response splitting attacks see OWASP: https://owasp.org/www-community/attacks/HTTP_Response_Splitting

**Why.** Reported as CWE-113. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs.HRS_REQUEST_PARAMETER_TO_HTTP_HEADER-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// untrusted input (source)
($X.servlet.http.HttpServletRequest $REQ).getParameter(...);
($X.servlet.http.HttpServletRequest $REQ).getParameterNames();
($X.servlet.http.HttpServletRequest $REQ).getParameterValues(...);
($X.servlet.http.HttpServletRequest $REQ).getParameterMap();
($X.servlet.http.HttpServletRequest $REQ).getHeader(...);
($X.servlet.http.HttpServletRequest $REQ).getPathInfo();
// flows to sink without sanitization
($X.servlet.http.HttpServletResponse $RES).setHeader("$KEY", ...);
($X.servlet.http.HttpServletResponse $RES).addHeader("$KEY", ...);
($X.servlet.http.HttpServletResponseWrapper $WRP).setHeader("$KEY", ...);
($X.servlet.http.HttpServletResponseWrapper $WRP).addHeader("$KEY", ...);
```

Good:

```java
$STR
org.apache.commons.text.StringEscapeUtils.unescapeJava(...);
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.HRS_REQUEST_PARAMETER_TO_HTTP_HEADER-1` (metavariables start with `$`):

- `$STR.replaceAll("$INPUT", "...");
...`
- `$STR`
- `.*\[(?=.*\\r)(?=.*\\n).*\]\+`
- `org.apache.commons.text.StringEscapeUtils.unescapeJava(...);`
- `($X.servlet.http.HttpServletResponse $RES).setHeader("$KEY", ...);`
- `($X.servlet.http.HttpServletResponse $RES).addHeader("$KEY", ...);`
- `($X.servlet.http.HttpServletResponseWrapper $WRP).setHeader("$KEY", ...);`
- `($X.servlet.http.HttpServletResponseWrapper $WRP).addHeader("$KEY", ...);`
- `($X.servlet.http.HttpServletRequest $REQ).getParameter(...);`
- `($X.servlet.http.HttpServletRequest $REQ).getParameterNames();`
- `($X.servlet.http.HttpServletRequest $REQ).getParameterValues(...);`
- `($X.servlet.http.HttpServletRequest $REQ).getParameterMap();`
- `($X.servlet.http.HttpServletRequest $REQ).getHeader(...);`
- `($X.servlet.http.HttpServletRequest $REQ).getPathInfo();`
