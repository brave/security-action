---
name: oss/trailofbits.go.racy-write-to-map.racy-write-to-map
rubric: safety
severity: should_fix
languages: [go]
cwe: [CWE-362]
---

**Rule.** Writing `$MAP` from multiple goroutines is not concurrency safe

**Why.** Reported as CWE-362: Concurrent Execution using Shared Resource with Improper Synchronization ('Race Condition'). See https://go.dev/blog/maps#concurrency. Ported from opengrep rule `trailofbits.go.racy-write-to-map.racy-write-to-map` (generated/oss/vulns.yaml).

## Examples

Bad:

```go
$MAP[$KEY] = $VALUE
```

Good:

```go
$MUTEX.Lock()
...
$MUTEX.Unlock()
$MUTEX.Lock()
...
defer $MUTEX.Unlock()
...
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.go.racy-write-to-map.racy-write-to-map` (metavariables start with `$`):

- `$MAP[$KEY] = $VALUE`
- `$MAP = make(map[$KTYPE]$VTYPE)
...
for ... {
  ...
  go func(...) {
    ...
    $MAP[$KEY] = $VALUE
    ...
  }(...)
  ...
}`
- `$MUTEX.Lock()
...
$MUTEX.Unlock()`
- `$MUTEX.Lock()
...
defer $MUTEX.Unlock()
...`
