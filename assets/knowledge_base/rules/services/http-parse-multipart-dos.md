---
name: services/http-parse-multipart-dos
rubric: safety
severity: nit
languages: [go]
---

**Rule.** ParseMultipartForm is vulnerable to Denial of Service (DoS) by clients sending a large HTTP request body. The specified limit of $MAXSIZE is the maximum amount stored in memory. The remainder is still parsed and stored on disk in temporary files. Wrapping $R.Body with http.MaxBytesReader prevents this wasting of server resources.

**Why.** Reported as CWE-400: Uncontrolled Resource Consumption. See https://pkg.go.dev/net/http#Request.ParseMultipartForm. See https://pkg.go.dev/net/http#MaxBytesReader. Ported from opengrep rule `http-parse-multipart-dos` (services/http-parse-multipart-dos.yaml).

## Examples

Bad:

```go
$R.ParseMultipartForm($MAXSIZE)
```

Good:

```go
$R.Body = http.MaxBytesReader($W, <...$R.Body...>, $LIMIT)
...
```

## Detection hints

Literal patterns from opengrep rule `http-parse-multipart-dos` (metavariables start with `$`):

- `$R.ParseMultipartForm($MAXSIZE)`
- `$R.Body = http.MaxBytesReader($W, <...$R.Body...>, $LIMIT)
...`
