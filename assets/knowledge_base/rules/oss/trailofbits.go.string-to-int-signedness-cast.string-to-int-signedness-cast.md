---
name: oss/trailofbits.go.string-to-int-signedness-cast.string-to-int-signedness-cast
rubric: safety
severity: should_fix
languages: [go]
---

**Rule.** Downcasting or changing sign of an integer with `$CAST_METHOD` method

**Why.** Reported as CWE-681: Incorrect Conversion between Numeric Types. See https://github.com/golang/go/issues/30209. Ported from opengrep rule `trailofbits.go.string-to-int-signedness-cast.string-to-int-signedness-cast` (generated/oss/audit.yaml).

## Examples

Bad:

```go
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.go.string-to-int-signedness-cast.string-to-int-signedness-cast` (metavariables start with `$`):

- `uint8`
- `uint16`
- `uint32`
- `int8`
- `int16`
- `int32`
- `$X, ... = strconv.Atoi(...)
...
$CAST_METHOD($X)`
- `$X, ... = strconv.ParseInt(..., ..., 64)
...
$CAST_METHOD($X)`
- `$X, ... = strconv.ParseUint(..., ..., 64)
...
$CAST_METHOD($X)`
- `$X, ... = strconv.Atoi(...)
...
uint64($X)`
- `$X, ... = strconv.ParseInt(..., ..., 64)
...
uint64($X)`
- `$X, ... = strconv.ParseUint(..., ..., 64)
...
int64($X)`
- `$X, ... = strconv.ParseInt(..., ..., 32)
...
$CAST_METHOD($X)`
- `$X, ... = strconv.ParseUint(..., ..., 32)
...
$CAST_METHOD($X)`
- `$X, ... = strconv.ParseInt(..., ..., 32)
...
uint32($X)`
- `$X, ... = strconv.ParseUint(..., ..., 32)
...
int32($X)`
- `$X, ... = strconv.ParseInt(..., ..., 16)
...
$CAST_METHOD($X)`
- `$X, ... = strconv.ParseUint(..., ..., 16)
...
$CAST_METHOD($X)`
- `$X, ... = strconv.ParseInt(..., ..., 16)
...
uint16($X)`
- `$X, ... = strconv.ParseUint(..., ..., 16)
...
int16($X)`
- `$X, ... = strconv.ParseInt(..., ..., 8)
...
uint8($X)`
- `$X, ... = strconv.ParseUint(..., ..., 8)
...
int8($X)`
