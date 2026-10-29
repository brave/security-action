---
name: oss/trailofbits.go.unsafe-dll-loading.unsafe-dll-loading
rubric: safety
severity: should_fix
languages: [go]
---

**Rule.** The function is vulnerable to DLL hijacking attacks. Use `windows.NewLazySystemDLL()` function to limit DLL search to the Windows directory

**Why.** Reported as CWE-427: Uncontrolled Search Path Element. See https://pkg.go.dev/golang.org/x/sys/windows#LazyDLL. Ported from opengrep rule `trailofbits.go.unsafe-dll-loading.unsafe-dll-loading` (generated/oss/vulns.yaml).

## Examples

Bad:

```go
syscall.LoadDLL(...)
syscall.LoadLibrary(...)
windows.LoadDLL(...)
windows.MustLoadDLL(...)
syscall.NewLazyDLL(...)
$X = windows.NewLazyDLL(...)
...
$X.$Y()
...
$X.System = true
$X = windows.NewLazyDLL(...)
...
$X.$Y()
```

Good:

```go
$X = windows.NewLazyDLL(...)
...
$X.System = true
...
$X.$Y()
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.go.unsafe-dll-loading.unsafe-dll-loading` (metavariables start with `$`):

- `syscall.LoadDLL(...)`
- `syscall.LoadLibrary(...)`
- `windows.LoadDLL(...)`
- `windows.MustLoadDLL(...)`
- `syscall.NewLazyDLL(...)`
- `$X = windows.NewLazyDLL(...)
...
$X.$Y()
...
$X.System = true`
- `$X = windows.NewLazyDLL(...)
...
$X.$Y()`
- `$X = windows.NewLazyDLL(...)
...
$X.System = true
...
$X.$Y()`
