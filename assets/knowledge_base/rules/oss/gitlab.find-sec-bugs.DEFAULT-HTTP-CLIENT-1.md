---
name: oss/gitlab.find-sec-bugs.DEFAULT-HTTP-CLIENT-1
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** The `org.apache.http.impl.client.DefaultHttpClient` does not verify the hostnames upon connection. This allows for an adversary who is in between the application and the target host to intercept potentially sensitive information or transmit malicious data. Do not use the `org.apache.http.impl.client.DefaultHttpClient();` as it is deprecated. Instead use the new `java.net.http.HttpClient` that was introduced in Java 9. Example connecting to a host that will automatically do TLS validation: ``` // Create a new java.net.http.HttpClient HttpClient httpClient = HttpClient.newHttpClient(); // Create a HttpRequest builder HttpRequest request = HttpRequest.newBuilder() // Create a URI for a website which requires TLS .uri(URI.create("https://www.example.com/")) // Build the request .build(); // Use the httpClient to send the request and use an HttpResponse.BodyHandlers String type HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString()); // Debug print System.out.println(response); ```

**Why.** Reported as CWE-295. Ported from opengrep rule `gitlab.find_sec_bugs.DEFAULT_HTTP_CLIENT-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
new org.apache.http.impl.client.DefaultHttpClient();
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.DEFAULT_HTTP_CLIENT-1` (metavariables start with `$`):

- `new org.apache.http.impl.client.DefaultHttpClient();`
