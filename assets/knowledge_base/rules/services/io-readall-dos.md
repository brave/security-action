---
name: services/io-readall-dos
rubric: safety
severity: nit
languages: [go]
cwe: [CWE-400]
---

**Rule.** io.ReadAll is vulnerable to Denial of Service (DoS) by clients sending a large HTTP request body. Wrapping $R.Body with http.MaxBytesReader (or io.LimitReader) prevents this wasting of server resources.

**Why.** Reported as CWE-400: Uncontrolled Resource Consumption. See https://pkg.go.dev/io#ReadAll. See https://pkg.go.dev/net/http#MaxBytesReader. Ported from opengrep rule `io-readall-dos` (services/io-readall-dos.yaml).

## Examples

Bad:

```go
io.ReadAll($R.Body)
```

Good:

```go
$R.Body = http.MaxBytesReader($W, <...$R.Body...>, $LIMIT)
...
```

## Detection hints

Literal patterns from opengrep rule `io-readall-dos` (metavariables start with `$`):

- `io.ReadAll($R.Body)`
- `$R.Body = http.MaxBytesReader($W, <...$R.Body...>, $LIMIT)
...`
