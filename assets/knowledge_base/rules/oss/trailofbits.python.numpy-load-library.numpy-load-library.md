---
name: oss/trailofbits.python.numpy-load-library.numpy-load-library
rubric: safety
severity: should_fix
languages: [python]
---

**Rule.** Loading custom operator libraries can result in arbitrary code execution

**Why.** Reported as CWE-676: Use of Potentially Dangerous Function. See https://numpy.org/doc/stable/reference/routines.ctypeslib.html#numpy.ctypeslib.load_library. Ported from opengrep rule `trailofbits.python.numpy-load-library.numpy-load-library` (generated/oss/audit.yaml).

## Examples

Bad:

```python
numpy.ctypeslib.load_library(...)
```

Good:

```python
numpy.ctypeslib.load_library("...", "...")
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.python.numpy-load-library.numpy-load-library` (metavariables start with `$`):

- `numpy.ctypeslib.load_library(...)`
- `numpy.ctypeslib.load_library("...", "...")`
