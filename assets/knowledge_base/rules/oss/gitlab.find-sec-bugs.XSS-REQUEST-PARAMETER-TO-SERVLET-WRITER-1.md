---
name: oss/gitlab.find-sec-bugs.XSS-REQUEST-PARAMETER-TO-SERVLET-WRITER-1
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** The application is returning user-supplied data from an HTTP request directly into an HTTP response output writer. This could lead to Cross Site Scripting (XSS) if the input were malicious script code and the application server is not properly validating the output. XSS is an attack which exploits a web application or system to treat user input as markup or script code. It is important to encode the data depending on the specific context it is used in. There are at least six context types: - Inside HTML tags `<div>context 1</div>` - Inside attributes: `<div class="context 2"></div>` - Inside event attributes `<button onclick="context 3">button</button>` - Inside script blocks: `<script>var x = "context 4"</script>` - Unsafe element HTML assignment: `element.innerHTML = "context 5"` - Inside URLs: `<iframe src="context 6"></iframe><a href="context 6">link</a>` Script blocks alone have multiple ways they need to be encoded. Extra care must be taken if user input is ever output inside of script tags. User input that is displayed within the application must be encoded, sanitized or validated to ensure it cannot be treated as HTML or executed as Javascript code. Care must also be taken to not mix server-side templating with client-side templating, as the server-side templating will not encode things like {{ 7*7 }} which may execute client-side templating features. It is _NOT_ advised to encode user input prior to inserting into a data store. The data will need to be encoded depending on context of where it is output. It is much safer to force the displaying system to handle the encoding and not attempt to guess how it should be encoded. If possible do not use user input directly in the output to the response writer. If the application must output user-supplied input, it will need to encode the data depending on the output context. Consider using [Apache Commons Text](https://commons.apache.org/proper/commons-text/) `StringEscapeUtils` methods for various context. Please note there is no way to safely output script code in most circumstances, regardless of encoding. If calling the HTTP response writer directly, ensure that the `Content-Type` is set to `text/plain` so it will not be accidentally interpreted by HTML by modern browsers. ``` // Get user input String htmlInput = request.getParameter("userInput"); // Encode the input using the Html4 encoder String htmlEncoded = StringEscapeUtils.escapeHtml4(htmlInput); // Force the HTTP response to be content type of text/plain so it is not interpreted as HTML response.setContentType("text/plain"); // Ensure UTF-8 response.setCharacterEncoding("UTF-8"); // Write response response.getWriter().write(htmlEncoded); ``` For more information on XSS see OWASP: - https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html

**Why.** Reported as CWE-79. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs.XSS_REQUEST_PARAMETER_TO_SERVLET_WRITER-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// untrusted input (source)
(javax.servlet.http.HttpServletRequest $R).$METHOD(...)
(java.util.Scanner $S).$METHOD(...)
(java.util.stream.Stream).$METHOD(...)
(java.util.StringJoiner $SJ).toString(...)
(java.sql.ResultSet.getString $R).$METHOD(...)
(java.lang.System $S).getProperty(...)
(java.lang.System $S).getenv(...)
(java.lang.StringBuilder $SB).toString(...)
(java.io.FileInputStream $F).read(...)
(java.io.FileReader $F).read(...)
(java.net.Socket $S).getInputStream(...)
(java.net.Socket $S).getOutputStream(...)
(java.net.DatagramSocket $S).receive(...)
(java.net.DatagramSocket $S).getInputStream(...)
java.nio.file.Files.readAllBytes(...)
java.nio.file.Files.readAllLines(...)
java.nio.file.Files.lines(...)
java.nio.file.Files.newBufferedReader(...)
org.apache.commons.io.IOUtils.toString(...)
org.apache.commons.io.IOUtils.readLines(...)
org.apache.commons.io.IOUtils.toByteArray(...)
(com.fasterxml.jackson.databind.ObjectMapper $OM).readValue(...)
(com.fasterxml.jackson.databind.ObjectMapper $OM).treeToValue(...)
$CLASS.$METHOD(..., (javax.servlet.http.HttpServletRequest $R), ...)
$FUNC(..., (javax.servlet.http.HttpServletRequest $R), ...)
// flows to sink without sanitization
(javax.servlet.http.HttpServletResponse $R).getWriter().print(...)
$W.print(...);
(javax.servlet.http.HttpServletResponse $R).getWriter().println(...)
$W.println(...);
(javax.servlet.http.HttpServletResponse $R).getWriter().format(...)
$W.format(...);
(javax.servlet.http.HttpServletResponse $R).getWriter().append(...)
$W.append(...);
(javax.servlet.http.HttpServletResponse $R).getWriter().write(...)
$W.write(...);
```

Good:

```java
org.owasp.encoder.Encode.forHtml(...)
org.owasp.esapi.ESAPI.encoder().encodeForHTML(...)
org.apache.commons.text.StringEscapeUtils.escapeHtml3(...)
org.apache.commons.text.StringEscapeUtils.escapeHtml4(...)
org.owasp.benchmark.helpers.Utils.encodeForHTML(...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.XSS_REQUEST_PARAMETER_TO_SERVLET_WRITER-1` (metavariables start with `$`):

- `(javax.servlet.http.HttpServletRequest $R).$METHOD(...)`
- `(java.util.Scanner $S).$METHOD(...)`
- `(java.util.stream.Stream).$METHOD(...)`
- `(java.util.StringJoiner $SJ).toString(...)`
- `(java.sql.ResultSet.getString $R).$METHOD(...)`
- `(java.lang.System $S).getProperty(...)`
- `(java.lang.System $S).getenv(...)`
- `(java.lang.StringBuilder $SB).toString(...)`
- `(java.io.FileInputStream $F).read(...)`
- `(java.io.FileReader $F).read(...)`
- `(java.net.Socket $S).getInputStream(...)`
- `(java.net.Socket $S).getOutputStream(...)`
- `(java.net.DatagramSocket $S).receive(...)`
- `(java.net.DatagramSocket $S).getInputStream(...)`
- `java.nio.file.Files.readAllBytes(...)`
- `java.nio.file.Files.readAllLines(...)`
- `java.nio.file.Files.lines(...)`
- `java.nio.file.Files.newBufferedReader(...)`
- `org.apache.commons.io.IOUtils.toString(...)`
- `org.apache.commons.io.IOUtils.readLines(...)`
- `org.apache.commons.io.IOUtils.toByteArray(...)`
- `(com.fasterxml.jackson.databind.ObjectMapper $OM).readValue(...)`
- `(com.fasterxml.jackson.databind.ObjectMapper $OM).treeToValue(...)`
- `$CLASS.$METHOD(..., (javax.servlet.http.HttpServletRequest $R), ...)`
- `$FUNC(..., (javax.servlet.http.HttpServletRequest $R), ...)`
- `$FUNC(..., String $X, ...) { ... }`
- `$LIST.add($X)`
- `$MAP.put(..., $X)`
- `$STR.concat($X)`
- `$STR = String.format(..., $X, ...)`
- `$STR = String.join(..., $X, ...)`
- `org.owasp.encoder.Encode.forHtml(...)`
- `org.owasp.esapi.ESAPI.encoder().encodeForHTML(...)`
- `org.apache.commons.text.StringEscapeUtils.escapeHtml3(...)`
- `org.apache.commons.text.StringEscapeUtils.escapeHtml4(...)`
- `org.owasp.benchmark.helpers.Utils.encodeForHTML(...)`
- `(javax.servlet.http.HttpServletResponse $R).getWriter().print(...)`
- `$W = (javax.servlet.http.HttpServletResponse $R).getWriter();
...`
- `$W.print(...);`
- `(javax.servlet.http.HttpServletResponse $R).getWriter().println(...)`
- `$W.println(...);`
- `(javax.servlet.http.HttpServletResponse $R).getWriter().format(...)`
- `$W.format(...);`
- `(javax.servlet.http.HttpServletResponse $R).getWriter().append(...)`
- `$W.append(...);`
- `(javax.servlet.http.HttpServletResponse $R).getWriter().write(...)`
- `$W.write(...);`
