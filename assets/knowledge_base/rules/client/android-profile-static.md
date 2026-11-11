---
name: client/android-profile-static
rubric: correctness
severity: should_fix
languages: [java, kotlin]
---

**Rule.** Static methods to access the profile will become a problem when android allows multiple profiles. Also these methods can be dangerous when we need to distinguish between the regular and incognito profile (services factories, etc...)

**Why.** Ported from opengrep rule `android-profile-static` (client/android-profile-static.yaml).

## Examples

Bad:

```java
ProfileManager.getLastUsedRegularProfile()
Utils.getProfile()
BraveLeoPrefUtils.getProfile()
```

## Detection hints

Literal patterns from opengrep rule `android-profile-static` (metavariables start with `$`):

- `ProfileManager.getLastUsedRegularProfile()`
- `Utils.getProfile()`
- `BraveLeoPrefUtils.getProfile()`
