---
name: oss/trailofbits.python.numpy-f2py-compile.numpy-f2py-compile
rubric: safety
severity: should_fix
languages: [python]
cwe: [CWE-676]
---

**Rule.** Compiling arbitrary code can result in code execution. Ensure the source code is from a trusted location

**Why.** Reported as CWE-676: Use of Potentially Dangerous Function. See https://numpy.org/doc/stable/f2py/usage.html. Ported from opengrep rule `trailofbits.python.numpy-f2py-compile.numpy-f2py-compile` (generated/oss/audit.yaml).

## Examples

Bad:

```python
numpy.f2py.compile(...)
```

Good:

```python
numpy.f2py.compile("...", ...)
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.python.numpy-f2py-compile.numpy-f2py-compile` (metavariables start with `$`):

- `numpy.f2py.compile(...)`
- `numpy.f2py.compile("...", ...)`
