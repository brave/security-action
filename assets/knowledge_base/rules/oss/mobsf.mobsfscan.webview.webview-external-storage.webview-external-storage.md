---
name: oss/mobsf.mobsfscan.webview.webview-external-storage.webview-external-storage
rubric: correctness
severity: should_fix
languages: [java]
---

**Rule.** WebView load files from external storage. Files in external storage can be modified by any application.

**Why.** Reported as cwe-749. Ported from opengrep rule `mobsf.mobsfscan.webview.webview_external_storage.webview_external_storage` (generated/oss/others.yaml).

## Examples

Bad:

```java
$X = <... $E.getExternalStorageDirectory() ...>;
...
$WV.loadUrl(<... $X ...>);
$WV.loadUrl(<... $E.getExternalStorageDirectory().$F() ...>);
$X = <... Environment.getExternalStorageDirectory().$F() ...>;
...
$WV.loadUrl(<... $X ...>);
$X = <... $E.getExternalFilesDir(...) ...>;
...
$WV.loadUrl(<... $X ...>);
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.webview.webview_external_storage.webview_external_storage` (metavariables start with `$`):

- `$X = <... $E.getExternalStorageDirectory() ...>;
...
$WV.loadUrl(<... $X ...>);`
- `$WV.loadUrl(<... $E.getExternalStorageDirectory().$F() ...>);`
- `$X = <... Environment.getExternalStorageDirectory().$F() ...>;
...
$WV.loadUrl(<... $X ...>);`
- `$X = <... $E.getExternalFilesDir(...) ...>;
...
$WV.loadUrl(<... $X ...>);`
