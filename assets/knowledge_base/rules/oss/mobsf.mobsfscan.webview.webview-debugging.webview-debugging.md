---
name: oss/mobsf.mobsfscan.webview.webview-debugging.webview-debugging
rubric: correctness
severity: should_fix
languages: [java]
---

**Rule.** Remote WebView debugging is enabled. This allows an attacker with debugging access to interact with the webview and steal or corrupt data.

**Why.** Reported as cwe-489. Ported from opengrep rule `mobsf.mobsfscan.webview.webview_debugging.webview_debugging` (generated/oss/others.yaml).

## Examples

Bad:

```java
$WB.setWebContentsDebuggingEnabled(true);
$X = true;
...
$WB.setWebContentsDebuggingEnabled($X);
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.webview.webview_debugging.webview_debugging` (metavariables start with `$`):

- `$WB.setWebContentsDebuggingEnabled(true);`
- `$X = true;
...
$WB.setWebContentsDebuggingEnabled($X);`
