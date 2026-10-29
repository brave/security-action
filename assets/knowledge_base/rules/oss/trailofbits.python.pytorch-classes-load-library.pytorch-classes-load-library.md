---
name: oss/trailofbits.python.pytorch-classes-load-library.pytorch-classes-load-library
rubric: safety
severity: should_fix
languages: [python]
cwe: [CWE-676]
---

**Rule.** Loading custom operator libraries can result in arbitrary code execution

**Why.** Reported as CWE-676: Use of Potentially Dangerous Function. See https://pytorch.org/tutorials/advanced/torch_script_custom_classes.html. Ported from opengrep rule `trailofbits.python.pytorch-classes-load-library.pytorch-classes-load-library` (generated/oss/audit.yaml).

## Examples

Bad:

```python
torch.classes.load_library(...)
```

Good:

```python
torch.classes.load_library("...")
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.python.pytorch-classes-load-library.pytorch-classes-load-library` (metavariables start with `$`):

- `torch.classes.load_library(...)`
- `torch.classes.load_library("...")`
