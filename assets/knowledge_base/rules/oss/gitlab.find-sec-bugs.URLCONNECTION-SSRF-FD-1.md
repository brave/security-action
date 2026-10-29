---
name: oss/gitlab.find-sec-bugs.URLCONNECTION-SSRF-FD-1
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** Server-Side-Request-Forgery (SSRF) exploits backend systems that initiate requests to third parties. If user input is used in constructing or sending these requests, an attacker could supply malicious data to force the request to other systems or modify request data to cause unwanted actions. Ensure user input is not used directly in constructing URLs or URIs when initiating requests to third party systems from back end systems. Care must also be taken when constructing payloads using user input. Where possible restrict to known URIs or payloads. Consider using a server-side map where keys are used to return URLs such as `https://site/goto?key=1` where `{key: 1, url: 'http://some.url/', key: 2, url: 'http://...'}`. If you must use user-supplied input for requesting URLs, it is strongly recommended that the HTTP client chosen allows you to customize and block certain IP ranges at the network level. By blocking RFC 1918 addresses or other network address ranges, you can limit the severity of a successful SSRF attack. Care must also be taken to block certain protocol or address formatting such as IPv6. If you cannot block address ranges at the client level, you may want to run the HTTP client as a protected user, or in a protected network where you can apply IP Table or firewall rules to block access to dangerous addresses. Finally, if none of the above protections are available, you could also run a custom HTTP proxy and force all requests through it to handle blocking dangerous addresses. Example using a map to look up a key to be used in a HTTP request: ``` HashMap<String, String> lookupTable = new HashMap<>(); lookupTable.put("key1", "https://example.com/"); lookupTable.put("key2", "https://safeurl.com/"); String userInput = request.getParameter("key"); // Create a CloseableHttpClient, ideally any requests issued should be done // out-of-band from the servlet request itself (such as using a separate thread/scheduler system) try (final CloseableHttpClient httpClient = HttpClients.createDefault()) { // Lookup the value from our user input from our lookupTable String value = lookupTable.getOrDefault(userInput, "https://example.com/"); // Construct the url, with the hardcoded url and only pass in the value from the lookupTable, // not direct user input final HttpGet httpget = new HttpGet(value); // Execute the request CloseableHttpResponse clientResponse = httpClient.execute(httpget); // Read the response byte[] responseData = clientResponse.getEntity().getContent().readAllBytes(); // Handle the response // ... } ``` If using a map is not possible, the user-supplied input must be encoded prior to use, and never allow full URLs: ``` // Get user input String userInput = request.getParameter("key"); // Encode the string using java.net.URLEncoder with the UTF-8 character set String encodedString = java.net.URLEncoder.encode(userInput, StandardCharsets.UTF_8); // Create a CloseableHttpClient, ideally any requests issued should be done // out-of-band from the servlet request itself (such as using a separate thread/scheduler system) try (final CloseableHttpClient httpClient = HttpClients.createDefault()) { // Construct the url, with the hardcoded url and only pass in the encoded value, never a full URL final HttpGet httpget = new HttpGet("https://example.com/getId?key="+encodedString); // Execute the request CloseableHttpResponse clientResponse = httpClient.execute(httpget); // Read the response byte[] responseData = clientResponse.getEntity().getContent().readAllBytes(); // handle the response } ``` For more information on SSRF see OWASP: https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html

**Why.** Reported as CWE-918. Ported from opengrep rule `gitlab.find_sec_bugs.URLCONNECTION_SSRF_FD-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.URLCONNECTION_SSRF_FD-1` (metavariables start with `$`):

- `import java.net.*;
...`
- `import java.net.URL;
...`
- `import java.net.URI;
...`
- `new $TYPE(...). ... .$FUNC`
- `new $TYPE("..."). ... .$FUNC`
- `connect`
- `GetContent`
- `openConnection`
- `openStream`
- `getContent`
- `URL`
- `java.net.URL`
- `URI`
- `java.net.URI`
- `import java.net.InetSocketAddress;
...`
- `new InetSocketAddress(..., $PORT)`
- `new InetSocketAddress("...", $PORT)`
