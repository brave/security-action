---
name: oss/trailofbits.go.sync-mutex-value-copied.sync-mutex-value-copied
rubric: safety
severity: should_fix
languages: [go]
---

**Rule.** A `sync.Mutex` is copied in function `$FUNC` given that `$T` is value receiver. As a result, the struct `$T` may not be locked as intended

**Why.** Reported as CWE-688: Function Call With Incorrect Variable or Reference as Argument. See https://go101.org/article/concurrent-common-mistakes.html. Ported from opengrep rule `trailofbits.go.sync-mutex-value-copied.sync-mutex-value-copied` (generated/oss/vulns.yaml).

## Examples

Bad:

```go
func ($T $TYPE) $FUNC(...){
  ...
  $T.Lock()
  ...
}
func ($T $TYPE) $FUNC(...){
  ...
  $T.RLock()
  ...
}
```

Good:

```go
func ($T2 *$TYPE2) $FUNC(...){
  ...
}
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.go.sync-mutex-value-copied.sync-mutex-value-copied` (metavariables start with `$`):

- `func ($T $TYPE) $FUNC(...){
  ...
  $T.Lock()
  ...
}`
- `func ($T $TYPE) $FUNC(...){
  ...
  $T.RLock()
  ...
}`
- `func ($T2 *$TYPE2) $FUNC(...){
  ...
}`
