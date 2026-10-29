---
name: oss/mobsf.mobsfscan.webview.webview-file-access.webview-set-allow-file-access
rubric: correctness
severity: should_fix
languages: [java]
---

**Rule.** WebView File System Access is enabled. An attacker able to inject script into a WebView, could exploit the opportunity to access local resources.

**Why.** Reported as cwe-73. Ported from opengrep rule `mobsf.mobsfscan.webview.webview_file_access.webview_set_allow_file_access` (generated/oss/others.yaml).

## Examples

Bad:

```java
$WB.setAllowFileAccess(true);
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.webview.webview_file_access.webview_set_allow_file_access` (metavariables start with `$`):

- `$WB.setAllowFileAccess(true);`
