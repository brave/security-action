---
name: oss/gitlab.find-sec-bugs.HTTP-PARAMETER-POLLUTION-1
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** The application was found including unvalidated user input into a URL, which could lead to HTTP Parameter Pollution (HPP) or worse, Server Side Request Forgery (SSRF). This could allow an adversary to override the value of a URL or a request parameter. HTTP Parameter Pollution (HPP) attacks consist of injecting encoded query string delimiters into other existing parameters. If a web application does not properly sanitize the user input, an adversary may modify the logic of these requests to other applications. To remediate this issue, never allow user input directly into creation of a URL or URL parameter. Consider using a map to look up user-supplied information and return exact values to be used in the generation of requests. Example using a map to look up a key to be used in a HTTP request: ``` HashMap<String, String> lookupTable = new HashMap<>(); lookupTable.put("key1", "value1"); lookupTable.put("key2", "value2"); String userInput = request.getParameter("key"); // Create a CloseableHttpClient, ideally any requests issued should be done // out-of-band from the servlet request itself (such as using a separate thread/scheduler system) try (final CloseableHttpClient httpClient = HttpClients.createDefault()) { // Lookup the value from our user input from our lookupTable String value = lookupTable.getOrDefault(userInput, "value1"); // Construct the url, with the hardcoded url and only pass in the value from the lookupTable, // not direct user input final HttpGet httpget = new HttpGet("https://example.com/getId?key="+value); // Execute the request CloseableHttpResponse clientResponse = httpClient.execute(httpget); // Read the response byte[] responseData = clientResponse.getEntity().getContent().readAllBytes(); // Handle the response // ... } ``` If using a map is not possible, the user-supplied input must be encoded prior to use, and never allow full URLs: ``` // Get user input String userInput = request.getParameter("key"); // Encode the string using java.net.URLEncoder with the UTF-8 character set String encodedString = java.net.URLEncoder.encode(userInput, StandardCharsets.UTF_8); // Create a CloseableHttpClient, ideally any requests issued should be done // out-of-band from the servlet request itself (such as using a separate thread/scheduler system) try (final CloseableHttpClient httpClient = HttpClients.createDefault()) { // Construct the url, with the hardcoded url and only pass in the encoded value, never a full URL final HttpGet httpget = new HttpGet("https://example.com/getId?key="+encodedString); // Execute the request CloseableHttpResponse clientResponse = httpClient.execute(httpget); // Read the response byte[] responseData = clientResponse.getEntity().getContent().readAllBytes(); // handle the response } ``` For more information on SSRF see OWASP: https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html For more information on HTTP Parameter Pollution see: https://en.wikipedia.org/wiki/HTTP_parameter_pollution

**Why.** Reported as CWE-88. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs.HTTP_PARAMETER_POLLUTION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// untrusted input (source)
(HttpServletRequest $REQ).getParameter(...)
// flows to sink without sanitization
new org.apache.http.client.methods.HttpGet(...)
new org.apache.commons.httpclient.methods.GetMethod(...)
(org.apache.commons.httpclient.methods.GetMethod $GM).setQueryString(...)
```

Good:

```java
java.net.URLEncoder.encode(...)
com.google.common.net.UrlEscapers.urlPathSegmentEscaper().escape(...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.HTTP_PARAMETER_POLLUTION-1` (metavariables start with `$`):

- `(HttpServletRequest $REQ).getParameter(...)`
- `java.net.URLEncoder.encode(...)`
- `com.google.common.net.UrlEscapers.urlPathSegmentEscaper().escape(...)`
- `new org.apache.http.client.methods.HttpGet(...)`
- `new org.apache.commons.httpclient.methods.GetMethod(...)`
- `(org.apache.commons.httpclient.methods.GetMethod $GM).setQueryString(...)`
