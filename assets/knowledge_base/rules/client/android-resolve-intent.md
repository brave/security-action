---
name: client/android-resolve-intent
rubric: safety
severity: should_fix
languages: [java, kotlin]
cwe: [CWE-927]
---

**Rule.** Implicit intents in resolveComponent and queryComponent methods for component launch may pose security risks, as other installed apps can register similar components with higher priority. Instead, it is recommended to use hardcoded package names for third-party components launch or getApplicationContext().getPackageName() for local component launch.

**Why.** Reported as CWE-927: Use of Implicit Intent for Sensitive Communication. Ported from opengrep rule `android-resolve-intent` (client/android-resolve-intent.yaml).

## Examples

Bad:

```java
....resolveService(...,...)
....resolveContentProvider(...,...)
....resolveActivity(...,...)
....resolveActivity(...)
....resolveActivityInfo(...,...)
....queryBroadcastReceivers(...,...)
....queryIntentActivities(...,...)
....queryIntentActivityOptions(...,...,...,...)
....queryIntentServices(...,...)
....queryIntentContentProviders(...,...)
```

## Detection hints

Literal patterns from opengrep rule `android-resolve-intent` (metavariables start with `$`):

- `....resolveService(...,...)`
- `....resolveContentProvider(...,...)`
- `....resolveActivity(...,...)`
- `....resolveActivity(...)`
- `....resolveActivityInfo(...,...)`
- `....queryBroadcastReceivers(...,...)`
- `....queryIntentActivities(...,...)`
- `....queryIntentActivityOptions(...,...,...,...)`
- `....queryIntentServices(...,...)`
- `....queryIntentContentProviders(...,...)`
