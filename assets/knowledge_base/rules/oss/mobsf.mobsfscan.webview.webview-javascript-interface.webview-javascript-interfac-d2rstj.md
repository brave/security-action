---
name: oss/mobsf.mobsfscan.webview.webview-javascript-interface.webview-javascript-interfac-d2rstj
rubric: correctness
severity: should_fix
languages: [java]
---

**Rule.** Ensure that javascript interface is implemented securely. Execution of user controlled code in WebView is a critical Security issue.

**Why.** Reported as cwe-749. Ported from opengrep rule `mobsf.mobsfscan.webview.webview_javascript_interface.webview_javascript_interface` (generated/oss/others.yaml).

## Examples

Bad:

```java
addJavascriptInterface(...)
$W.addJavascriptInterface(...)
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.webview.webview_javascript_interface.webview_javascript_interface` (metavariables start with `$`):

- `addJavascriptInterface(...)`
- `$W.addJavascriptInterface(...)`
