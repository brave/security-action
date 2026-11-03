---
name: oss/trailofbits.go.waitgroup-add-called-inside-goroutine.waitgroup-add-called-inside-5f9pqc
rubric: safety
severity: should_fix
languages: [go]
cwe: [CWE-667]
---

**Rule.** Calling `$WG.Add` inside of an anonymous goroutine may result in `$WG.Wait` waiting for more or less calls to `$WG.Done()` than expected

**Why.** Reported as CWE-667: Improper Locking. See https://go101.org/article/concurrent-common-mistakes.html. Ported from opengrep rule `trailofbits.go.waitgroup-add-called-inside-goroutine.waitgroup-add-called-inside-goroutine` (generated/oss/vulns.yaml).

## Examples

Bad:

```go
$WG := &sync.WaitGroup{}
...
go func(...) {
  ...
  $WG.Add(...)
  ...
}(...)
...
$WG.Wait()
var $WG sync.WaitGroup
...
go func(...) {
  ...
  $WG.Add(...)
  ...
}(...)
...
$WG.Wait()
```

Good:

```go
for ... {
  ...
  $WG.Add(...)
  ...
}
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.go.waitgroup-add-called-inside-goroutine.waitgroup-add-called-inside-goroutine` (metavariables start with `$`):

- `$WG := &sync.WaitGroup{}
...
go func(...) {
  ...
  $WG.Add(...)
  ...
}(...)
...
$WG.Wait()`
- `var $WG sync.WaitGroup
...
go func(...) {
  ...
  $WG.Add(...)
  ...
}(...)
...
$WG.Wait()`
- `for ... {
  ...
  $WG.Add(...)
  ...
}`
