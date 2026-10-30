---
name: client/chromium-crash-vs-dump-without-crashing
rubric: correctness
severity: nit
languages: [cpp, c]
---

**Rule.** Consider using DUMP_WILL_BE_CHECK() instead of base::debug::DumpWithoutCrashing() when the intent is to eventually become a CHECK, as it better communicates this intent and provides better debugging information. However, DumpWithoutCrashing() is appropriate for debugging issues that may not become CHECKs.

**Why.** See https://chromium.googlesource.com/chromium/src/+/main/base/check.h#324. Ported from opengrep rule `chromium-crash-vs-dump-without-crashing` (client/crash-vs-dump-without-crashing.yaml).

## Examples

Bad:

```cpp
base::debug::DumpWithoutCrashing()
```

Good:

```cpp
void $FUNC(...) {
  ...
  base::debug::DumpWithoutCrashing($LOCATION, $INTERVAL);
  ...
}
```

## Detection hints

Literal patterns from opengrep rule `chromium-crash-vs-dump-without-crashing` (metavariables start with `$`):

- `base::debug::DumpWithoutCrashing()`
- `void $FUNC(...) {
  ...
  base::debug::DumpWithoutCrashing($LOCATION, $INTERVAL);
  ...
}`
