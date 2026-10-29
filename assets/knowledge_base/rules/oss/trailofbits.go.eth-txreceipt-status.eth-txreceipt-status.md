---
name: oss/trailofbits.go.eth-txreceipt-status.eth-txreceipt-status
rubric: safety
severity: should_fix
languages: [go]
---

**Rule.** A transaction receipt's status is inspected using `$RECEIVER.Status()`. For bridges and exchanges, this is a high-risk pattern because even though the transaction was successful, calls within the transaction may have failed. Review the related code to ensure the following properties: 1. The receipt's success is not being used as a verification measure. 2. The transaction being inspected is from a finalized block.

**Why.** Reported as CWE-437: Incomplete Model of Endpoint Features. See https://blog.trailofbits.com/2023/08/23/the-engineers-guide-to-blockchain-finality/. Ported from opengrep rule `trailofbits.go.eth-txreceipt-status.eth-txreceipt-status` (generated/oss/audit.yaml).

## Examples

Bad:

```go
($RECEIVER : Receipt).Status
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.go.eth-txreceipt-status.eth-txreceipt-status` (metavariables start with `$`):

- `import "github.com/ethereum/go-ethereum/core/types"
...`
- `($RECEIVER : Receipt).Status`
