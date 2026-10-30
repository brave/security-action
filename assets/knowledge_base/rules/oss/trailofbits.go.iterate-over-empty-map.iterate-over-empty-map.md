---
name: oss/trailofbits.go.iterate-over-empty-map.iterate-over-empty-map
rubric: safety
severity: should_fix
languages: [go]
cwe: [CWE-665]
---

**Rule.** Iteration over a possibly empty map `$C`. This is likely a bug or redundant code

**Why.** Reported as CWE-665: Improper Initialization. See https://blog.trailofbits.com/2019/11/07/attacking-go-vr-ttps/. Ported from opengrep rule `trailofbits.go.iterate-over-empty-map.iterate-over-empty-map` (generated/oss/audit.yaml).

## Examples

Bad:

```go
$C = make(map[$T1] $T2, ...)
...
for $K := range $C { ... }
```

Good:

```go
$C = make(map[$T1] $T2, ...)
...
$C[$X] = $V
...
for $K := range $C { ... }
$C = make(map[$T1] $T2, ...)
...
$C[$X]++
...
for $K := range $C { ... }
$C = make(map[$T1] $T2, ...)
...
$C[$X]--
...
for $K := range $C { ... }
$C = make(map[$T1] $T2, ...)
...
$CODEC.Unmarshal($BYTES, &$C)
...
for $K := range $C { ... }
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.go.iterate-over-empty-map.iterate-over-empty-map` (metavariables start with `$`):

- `$C = make(map[$T1] $T2, ...)
...
for $K := range $C { ... }`
- `$C = make(map[$T1] $T2, ...)
...
$C[$X] = $V
...
for $K := range $C { ... }`
- `$C = make(map[$T1] $T2, ...)
...
$C[$X]++
...
for $K := range $C { ... }`
- `$C = make(map[$T1] $T2, ...)
...
$C[$X]--
...
for $K := range $C { ... }`
- `$C = make(map[$T1] $T2, ...)
...
$CODEC.Unmarshal($BYTES, &$C)
...
for $K := range $C { ... }`
