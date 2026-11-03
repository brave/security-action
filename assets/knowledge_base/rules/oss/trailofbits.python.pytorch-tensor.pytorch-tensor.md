---
name: oss/trailofbits.python.pytorch-tensor.pytorch-tensor
rubric: correctness
severity: should_fix
languages: [python]
---

**Rule.** Avoid using `torch.Tensor()` to directly create a tensor for efficiency and proper parsing

**Why.** See https://pytorch.org/docs/stable/tensors.html. Ported from opengrep rule `trailofbits.python.pytorch-tensor.pytorch-tensor` (generated/oss/others.yaml).

## Examples

Bad:

```python
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.python.pytorch-tensor.pytorch-tensor` (metavariables start with `$`):

- `torch.Tensor(...)`
