---
name: oss/trailofbits.python.numpy-in-pytorch-datasets.numpy-in-pytorch-datasets
rubric: safety
severity: should_fix
languages: [python]
cwe: [CWE-330]
---

**Rule.** Using the NumPy RNG inside of a PyTorch dataset can lead to a number of issues with loading data, including identical augmentations. Instead, use the random number generators built into Python and PyTorch

**Why.** Reported as CWE-330: Use of Insufficiently Random Values. See https://tanelp.github.io/posts/a-bug-that-plagues-thousands-of-open-source-ml-projects. Ported from opengrep rule `trailofbits.python.numpy-in-pytorch-datasets.numpy-in-pytorch-datasets` (generated/oss/audit.yaml).

## Examples

Bad:

```python
class $X(torch.utils.data.Dataset):
  ...
  def __getitem__(...):
    ...
    numpy.random.randint(...)
    ...
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.python.numpy-in-pytorch-datasets.numpy-in-pytorch-datasets` (metavariables start with `$`):

- `class $X(torch.utils.data.Dataset):
  ...
  def __getitem__(...):
    ...
    numpy.random.randint(...)
    ...`
