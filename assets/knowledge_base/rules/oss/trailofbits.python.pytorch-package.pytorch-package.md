---
name: oss/trailofbits.python.pytorch-package.pytorch-package
rubric: safety
severity: should_fix
languages: [python]
---

**Rule.** Avoid importing torch.package - it can result in arbitrary code execution via pickle

**Why.** Reported as CWE-502: Deserialization of Untrusted Data. See https://pytorch.org/docs/1.13/package.html#torch-package. See https://blog.trailofbits.com/2021/03/15/never-a-dill-moment-exploiting-machine-learning-pickle-files/. Ported from opengrep rule `trailofbits.python.pytorch-package.pytorch-package` (generated/oss/audit.yaml).

## Examples

Bad:

```python
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.python.pytorch-package.pytorch-package` (metavariables start with `$`):

- `import torch.package`
