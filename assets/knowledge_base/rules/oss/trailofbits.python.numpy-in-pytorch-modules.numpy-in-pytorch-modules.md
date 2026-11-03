---
name: oss/trailofbits.python.numpy-in-pytorch-modules.numpy-in-pytorch-modules
rubric: correctness
severity: should_fix
languages: [python]
---

**Rule.** Usage of NumPy library inside PyTorch `$MODULE` module was found. Avoid mixing these libraries for efficiency and proper ONNX loading

**Why.** See https://tanelp.github.io/posts/a-bug-that-plagues-thousands-of-open-source-ml-projects. Ported from opengrep rule `trailofbits.python.numpy-in-pytorch-modules.numpy-in-pytorch-modules` (generated/oss/others.yaml).

## Examples

Bad:

```python
numpy.$FN(...)
numpy. ... .$FN(...)
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.python.numpy-in-pytorch-modules.numpy-in-pytorch-modules` (metavariables start with `$`):

- `numpy.$FN(...)`
- `numpy. ... .$FN(...)`
- `class $MODULE(torch.nn.Module):
    ...`
