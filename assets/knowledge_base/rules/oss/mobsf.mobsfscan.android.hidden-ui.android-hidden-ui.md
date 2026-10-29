---
name: oss/mobsf.mobsfscan.android.hidden-ui.android-hidden-ui
rubric: correctness
severity: should_fix
languages: [java]
---

**Rule.** Hidden elements in view can be used to hide data from user. But this data can be leaked. If the view contains sensitive data, it might still be accessible through memory inspection. A good practice is to clear sensitive data before hiding it.

**Why.** Reported as cwe-919. Ported from opengrep rule `mobsf.mobsfscan.android.hidden_ui.android_hidden_ui` (generated/oss/others.yaml).

## Examples

Bad:

```java
$X.setVisibility(View.GONE);
$V = View.GONE;
...
$X.setVisibility($V);
$X.setVisibility(View.INVISIBLE);
$V = View.INVISIBLE;
...
$X.setVisibility($V);
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.android.hidden_ui.android_hidden_ui` (metavariables start with `$`):

- `$X.setVisibility(View.GONE);`
- `$V = View.GONE;
...
$X.setVisibility($V);`
- `$X.setVisibility(View.INVISIBLE);`
- `$V = View.INVISIBLE;
...
$X.setVisibility($V);`
