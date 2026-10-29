---
name: oss/trailofbits.go.racy-append-to-slice.racy-append-to-slice
rubric: safety
severity: should_fix
languages: [go]
---

**Rule.** Appending `$SLICE` from multiple goroutines is not concurrency safe

**Why.** Reported as CWE-362: Concurrent Execution using Shared Resource with Improper Synchronization ('Race Condition'). See https://go.dev/blog/maps#concurrency. Ported from opengrep rule `trailofbits.go.racy-append-to-slice.racy-append-to-slice` (generated/oss/vulns.yaml).

## Examples

Bad:

```go
$SLICE = append($SLICE, $ITEM)
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

Literal patterns from opengrep rule `trailofbits.go.racy-append-to-slice.racy-append-to-slice` (metavariables start with `$`):

- `$SLICE = append($SLICE, $ITEM)`
- `var $SLICE []$TYPE
...
for ... {
  ...
  go func(...) {
    ...
    $SLICE = append($SLICE, ...)
    ...
  }(...)
  ...
}`
- `$SLICE := make([]$TYPE, ...)
...
for ... {
  ...
  go func(...) {
    ...
    $SLICE = append($SLICE, ...)
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
