---
name: oss/trailofbits.python.numpy-distutils.numpy-distutils
rubric: safety
severity: should_fix
languages: [python]
cwe: [CWE-676]
---

**Rule.** NumPy distutils is deprecated, and will be removed in the future

**Why.** Reported as CWE-676: Use of Potentially Dangerous Function. See https://numpy.org/doc/stable/reference/distutils.html. Ported from opengrep rule `trailofbits.python.numpy-distutils.numpy-distutils` (generated/oss/audit.yaml).

## Examples

Bad:

```python
import numpy.distutils
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.python.numpy-distutils.numpy-distutils` (metavariables start with `$`):

- `import numpy.distutils`
