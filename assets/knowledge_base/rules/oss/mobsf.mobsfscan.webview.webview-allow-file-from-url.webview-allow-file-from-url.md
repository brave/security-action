---
name: oss/mobsf.mobsfscan.webview.webview-allow-file-from-url.webview-allow-file-from-url
rubric: correctness
severity: should_fix
languages: [java]
---

**Rule.** Ensure that user controlled URLs never reaches the Webview. Enabling file access from URLs in WebView can leak sensitive information from the file system.

**Why.** Reported as cwe-200. Ported from opengrep rule `mobsf.mobsfscan.webview.webview_allow_file_from_url.webview_allow_file_from_url` (generated/oss/others.yaml).

## Examples

Bad:

```java
setAllowFileAccessFromFileURLs(true)
$W.setAllowFileAccessFromFileURLs(true)
$X = true;
...
$W.setAllowFileAccessFromFileURLs($X);
setAllowUniversalAccessFromFileURLs(true)
$W.setAllowUniversalAccessFromFileURLs(true)
$X = true;
...
$W.setAllowUniversalAccessFromFileURLs($X);
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.webview.webview_allow_file_from_url.webview_allow_file_from_url` (metavariables start with `$`):

- `setAllowFileAccessFromFileURLs(true)`
- `$W.setAllowFileAccessFromFileURLs(true)`
- `$X = true;
...
$W.setAllowFileAccessFromFileURLs($X);`
- `setAllowUniversalAccessFromFileURLs(true)`
- `$W.setAllowUniversalAccessFromFileURLs(true)`
- `$X = true;
...
$W.setAllowUniversalAccessFromFileURLs($X);`
