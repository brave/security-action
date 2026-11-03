---
name: oss/gitlab.find-sec-bugs.XSS-REQUEST-PARAMETER-TO-SEND-ERROR-1
rubric: safety
severity: should_fix
languages: [java]
cwe: [CWE-79]
---

**Rule.** The application is returning user-supplied data from an HTTP request to an HTTP response's `sendError` method. This could lead to Cross Site Scripting (XSS) if the input were malicious script code and the application server is not properly validating the output. Note that Apache Tomcat 9 and above automatically encode the output and are not vulnerable. XSS is an attack which exploits a web application or system to treat user input as markup or script code. It is important to encode the data depending on the specific context it is used in. There are at least six context types: - Inside HTML tags `<div>context 1</div>` - Inside attributes: `<div class="context 2"></div>` - Inside event attributes `<button onclick="context 3">button</button>` - Inside script blocks: `<script>var x = "context 4"</script>` - Unsafe element HTML assignment: `element.innerHTML = "context 5"` - Inside URLs: `<iframe src="context 6"></iframe><a href="context 6">link</a>` Script blocks alone have multiple ways they need to be encoded. Extra care must be taken if user input is ever output inside of script tags. User input that is displayed within the application must be encoded, sanitized or validated to ensure it cannot be treated as HTML or executed as Javascript code. Care must also be taken to not mix server-side templating with client-side templating, as the server-side templating will not encode things like {{ 7*7 }} which may execute client-side templating features. It is _NOT_ advised to encode user input prior to inserting into a data store. The data will need to be encoded depending on context of where it is output. It is much safer to force the displaying system to handle the encoding and not attempt to guess how it should be encoded. If possible do not use user input directly in the output to the `sendError` message parameter. Regardless if the application server handles output encoding, consider encoding any user-supplied input that is used in the sendError method: Example using [Apache Commons Text](https://commons.apache.org/proper/commons-text/) `StringEscapeUtils.escapeHtml4`: ``` // Get user input String userInput = request.getParameter("key"); // Encode the input using the Html4 encoder String encoded = StringEscapeUtils.escapeHtml4(userInput); // Respond with the error code and value response.sendError(401, encoded); ``` For more information on XSS see OWASP: - https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html

**Why.** Reported as CWE-79. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs.XSS_REQUEST_PARAMETER_TO_SEND_ERROR-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// untrusted input (source)
$REQ.getParameter(...);
$REQ.getHeader(...);
$REQ.getRequestedSessionId();
$REQ.getQueryString();
// flows to sink without sanitization
$RES.sendError(..., $DATA);
$DATA
```

Good:

```java
$TAINTED
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.XSS_REQUEST_PARAMETER_TO_SEND_ERROR-1` (metavariables start with `$`):

- `org.owasp.encoder.Encode.forHtml($TAINTED);`
- `$TAINTED`
- `$FUNC(..., HttpServletResponse $RES, ...) {...}`
- `$RES.sendError(..., $DATA);`
- `$DATA`
- `$FUNC(..., HttpServletRequest $REQ, ...) {...}`
- `$REQ.getParameter(...);`
- `$REQ.getHeader(...);`
- `$REQ.getRequestedSessionId();`
- `$REQ.getQueryString();`
