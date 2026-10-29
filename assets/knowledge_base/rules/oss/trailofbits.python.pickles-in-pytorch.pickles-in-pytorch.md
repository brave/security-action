---
name: oss/trailofbits.python.pickles-in-pytorch.pickles-in-pytorch
rubric: safety
severity: should_fix
languages: [python]
---

**Rule.** Functions reliant on pickle can result in arbitrary code execution. Consider loading from `state_dict`, using fickling, or switching to a safer serialization method like ONNX

**Why.** Reported as CWE-502: Deserialization of Untrusted Data. See https://blog.trailofbits.com/2021/03/15/never-a-dill-moment-exploiting-machine-learning-pickle-files/. Ported from opengrep rule `trailofbits.python.pickles-in-pytorch.pickles-in-pytorch` (generated/oss/vulns.yaml).

## Examples

Bad:

```python
torch.save(...)
torch.load(...)
```

Good:

```python
torch.load("...")
torch.save(..., "...")
torch.save($M.state_dict(), ...)
$M.load_state_dict(...)
torch.save($STATE_DICT, ...)
$STATE_DICT = $M.state_dict()
...
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.python.pickles-in-pytorch.pickles-in-pytorch` (metavariables start with `$`):

- `torch.save(...)`
- `torch.load(...)`
- `torch.load("...")`
- `torch.save(..., "...")`
- `torch.save($M.state_dict(), ...)`
- `$M.load_state_dict(...)`
- `torch.save($STATE_DICT, ...)`
- `$STATE_DICT = $M.state_dict()
...`
