---
name: oss/trailofbits.go.missing-runlock-on-rwmutex.missing-runlock-on-rwmutex
rubric: safety
severity: should_fix
languages: [go]
---

**Rule.** Missing `RUnlock` on an `RWMutex` (`$T` variable) lock before returning from a function

**Why.** Reported as CWE-667: Improper Locking. See https://pkg.go.dev/sync#RWMutex. See https://blog.trailofbits.com/2020/06/09/how-to-check-if-a-mutex-is-locked-in-go/. Ported from opengrep rule `trailofbits.go.missing-runlock-on-rwmutex.missing-runlock-on-rwmutex` (generated/oss/vulns.yaml).

## Examples

Bad:

```go
panic(...)
return ...
($T : sync.RWMutex)
```

Good:

```go
$T.RUnlock()
...
defer $T.RUnlock()
...
defer func(...) {
  ...
  $T.RUnlock()
  ...
}(...)
...
$FOO(..., ..., func(...) { 
    ... 
})
return func(...) {
    ...
    $T.RUnlock()
    ...
}
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.go.missing-runlock-on-rwmutex.missing-runlock-on-rwmutex` (metavariables start with `$`):

- `panic(...)`
- `return ...`
- `($T : sync.RWMutex)`
- `$T.RLock()
...`
- `$T.RUnlock()
...`
- `defer $T.RUnlock()
...`
- `defer func(...) {
  ...
  $T.RUnlock()
  ...
}(...)
...`
- `$FOO(..., ..., func(...) { 
    ... 
})`
- `return func(...) {
    ...
    $T.RUnlock()
    ...
}`
