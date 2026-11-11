---
name: oss/trailofbits.go.eth-rpc-tracetransaction.eth-rpc-tracetransaction
rubric: safety
severity: should_fix
languages: [go]
cwe: [CWE-1284]
---

**Rule.** Using built-in transaction tracers can be dangerous if measures are not taken to filter out reverted call frames. Review the related code to ensure the following properties: 1. Reverted call frames and their associated subtraces are filtered out from any analysis. 2. The transaction being traced is from a finalized block.

**Why.** Reported as CWE-1284: Improper Validation of Specified Quantity in Input. See https://blog.trailofbits.com/2023/08/23/the-engineers-guide-to-blockchain-finality/. Ported from opengrep rule `trailofbits.go.eth-rpc-tracetransaction.eth-rpc-tracetransaction` (generated/oss/audit.yaml).

## Examples

Bad:

```go
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.go.eth-rpc-tracetransaction.eth-rpc-tracetransaction` (metavariables start with `$`):

- `$RECEIVER.TraceTransaction($CTX, $FILTER, $TRACECONF)`
- `$RECEIVER.TraceBlockByNumber($CTX, $FILTER, $TRACECONF)`
- `$RECEIVER.TraceBlockByHash($CTX, $FILTER, $TRACECONF)`
- `$RECEIVER.TraceBlock($CTX, $FILTER, $TRACECONF)`
- `$RECEIVER.TraceChain($CTX, ...)`
- `.*debug_traceBlock.*`
- `.*debug_traceTransaction.*`
- `.*debug_traceCall.*`
- `.*debug_traceBlockByNumber.*`
- `.*debug_traceBlockByHash.*`
- `.*trace_block.*`
- `.*trace_transaction.*`
- `.*trace_replayBlockTransactions.*`
- `.*trace_replayTransaction.*`
- `.*trace_filter.*`
- `.*trace_call.*`
- `.*trace_callMany.*`
- `.*trace_get.*`
