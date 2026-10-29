---
name: oss/trailofbits.python.waiting-with-pytorch-distributed.waiting-with-pytorch-distrib-plkxi0
rubric: safety
severity: should_fix
languages: [python]
---

**Rule.** Not waiting for requests is a source of undefined behavior

**Why.** Reported as CWE-758: Reliance on Undefined, Unspecified, or Implementation-Defined Behavior. See https://pytorch.org/docs/stable/distributed.html#torch.distributed.isend. Ported from opengrep rule `trailofbits.python.waiting-with-pytorch-distributed.waiting-with-pytorch-distributed` (generated/oss/vulns.yaml).

## Examples

Bad:

```python
$REQ = torch.distributed.irecv(...)
$REQ = torch.distributed.isend(...)
```

Good:

```python
...
$REQ.wait()
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.python.waiting-with-pytorch-distributed.waiting-with-pytorch-distributed` (metavariables start with `$`):

- `$REQ = torch.distributed.irecv(...)`
- `$REQ = torch.distributed.isend(...)`
- `...
$REQ.wait()`
