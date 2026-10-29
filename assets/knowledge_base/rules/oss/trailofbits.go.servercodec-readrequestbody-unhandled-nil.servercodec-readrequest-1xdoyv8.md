---
name: oss/trailofbits.go.servercodec-readrequestbody-unhandled-nil.servercodec-readrequest-1xdoyv8
rubric: safety
severity: should_fix
languages: [go]
---

**Rule.** The `func ($O *$CODEC) ReadRequestBody($ARG $TYPE) error` function does not handle `nil` argument, as the `ServerCodec` interface requires. An incorrect implementation could lead to denial of service

**Why.** Reported as CWE-476: NULL Pointer Dereference. See https://github.com/golang/go/blob/go1.15.2/src/net/rpc/server.go#L643-L658. Ported from opengrep rule `trailofbits.go.servercodec-readrequestbody-unhandled-nil.servercodec-readrequestbody-unhandled-nil` (generated/oss/vulns.yaml).

## Examples

Bad:

```go
func ($O *$CODEC) ReadRequestBody($ARG $TYPE) error {
  ...
}
```

Good:

```go
func ($O *$CODEC) ReadRequestBody($ARG $TYPE) error {
  ...
  if $ARG == nil { ... }
  ...
}
func ($O *$CODEC) ReadRequestBody($ARG $TYPE) error {
  ...
  if $ARG != nil { ... }
  ...
}
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.go.servercodec-readrequestbody-unhandled-nil.servercodec-readrequestbody-unhandled-nil` (metavariables start with `$`):

- `func ($O *$CODEC) ReadRequestBody($ARG $TYPE) error {
  ...
}`
- `func ($O *$CODEC) ReadRequestBody($ARG $TYPE) error {
  ...
  if $ARG == nil { ... }
  ...
}`
- `func ($O *$CODEC) ReadRequestBody($ARG $TYPE) error {
  ...
  if $ARG != nil { ... }
  ...
}`
