---
name: oss/trailofbits.go.missing-unlock-before-return.missing-unlock-before-return
rubric: safety
severity: should_fix
languages: [go]
cwe: [CWE-667]
---

**Rule.** Missing mutex unlock (`$T` variable) before returning from a function. This could result in panics resulting from double lock operations

**Why.** Reported as CWE-667: Improper Locking. See https://pkg.go.dev/sync#Mutex. See https://blog.trailofbits.com/2020/06/09/how-to-check-if-a-mutex-is-locked-in-go/. Ported from opengrep rule `trailofbits.go.missing-unlock-before-return.missing-unlock-before-return` (generated/oss/vulns.yaml).

## Examples

Bad:

```go
panic(...)
return ...
($T : sync.Mutex)
```

Good:

```go
$T.Unlock()
...
defer $T.Unlock()
...
defer func(...) {
  ...
  $T.Unlock()
  ...
}(...)
...
$FOO(..., ..., func(...) { 
    ... 
})
return func(...) {
    ...
    $T.Unlock()
    ...
}
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.go.missing-unlock-before-return.missing-unlock-before-return` (metavariables start with `$`):

- `panic(...)`
- `return ...`
- `($T : sync.Mutex)`
- `$T.Lock()
...`
- `$T.Unlock()
...`
- `defer $T.Unlock()
...`
- `defer func(...) {
  ...
  $T.Unlock()
  ...
}(...)
...`
- `$FOO(..., ..., func(...) { 
    ... 
})`
- `return func(...) {
    ...
    $T.Unlock()
    ...
}`
