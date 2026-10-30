---
name: oss/trailofbits.python.pickles-in-pytorch-distributed.pickles-in-pytorch-distributed
rubric: safety
severity: should_fix
languages: [python]
cwe: [CWE-502]
---

**Rule.** Functions reliant on pickle can result in arbitrary code execution

**Why.** Reported as CWE-502: Deserialization of Untrusted Data. See https://blog.trailofbits.com/2021/03/15/never-a-dill-moment-exploiting-machine-learning-pickle-files/. Ported from opengrep rule `trailofbits.python.pickles-in-pytorch-distributed.pickles-in-pytorch-distributed` (generated/oss/vulns.yaml).

## Examples

Bad:

```python
torch.distributed.broadcast_object_list(...)
torch.distributed.all_gather_object(...)
torch.distributed.gather_object(...)
torch.distributed.scatter_object_list(...)
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.python.pickles-in-pytorch-distributed.pickles-in-pytorch-distributed` (metavariables start with `$`):

- `torch.distributed.broadcast_object_list(...)`
- `torch.distributed.all_gather_object(...)`
- `torch.distributed.gather_object(...)`
- `torch.distributed.scatter_object_list(...)`
