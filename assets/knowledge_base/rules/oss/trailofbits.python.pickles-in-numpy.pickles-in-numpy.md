---
name: oss/trailofbits.python.pickles-in-numpy.pickles-in-numpy
rubric: safety
severity: should_fix
languages: [python]
---

**Rule.** Functions reliant on pickle can result in arbitrary code execution. Consider using fickling or switching to a safer serialization method

**Why.** Reported as CWE-502: Deserialization of Untrusted Data. See https://blog.trailofbits.com/2021/03/15/never-a-dill-moment-exploiting-machine-learning-pickle-files/. Ported from opengrep rule `trailofbits.python.pickles-in-numpy.pickles-in-numpy` (generated/oss/vulns.yaml).

## Examples

Bad:

```python
numpy.load(..., allow_pickle=$VALUE, ...)
```

Good:

```python
numpy.load("...", ...)
numpy.load(..., file="...", ...)
False
[]
None
""
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.python.pickles-in-numpy.pickles-in-numpy` (metavariables start with `$`):

- `numpy.load(..., allow_pickle=$VALUE, ...)`
- `numpy.load("...", ...)`
- `numpy.load(..., file="...", ...)`
- `False`
- `[]`
- `None`
- `""`
