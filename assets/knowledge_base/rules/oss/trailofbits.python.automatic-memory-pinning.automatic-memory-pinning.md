---
name: oss/trailofbits.python.automatic-memory-pinning.automatic-memory-pinning
rubric: safety
severity: should_fix
languages: [python]
cwe: [CWE-676]
---

**Rule.** If possible, it is better to rely on automatic pinning in PyTorch to avoid undefined behavior and for efficiency

**Why.** Reported as CWE-676: Use of Potentially Dangerous Function. See https://pytorch.org/docs/stable/data.html#memory-pinning. Ported from opengrep rule `trailofbits.python.automatic-memory-pinning.automatic-memory-pinning` (generated/oss/audit.yaml).

## Examples

Bad:

```python
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.python.automatic-memory-pinning.automatic-memory-pinning` (metavariables start with `$`):

- `torch.utils.data.DataLoader(...)`
- `torch.utils.data.DataLoader(..., pin_memory=$VALUE, ...)`
- `torch.utils.data.DataLoader(..., pin_memory=False, ...)`
