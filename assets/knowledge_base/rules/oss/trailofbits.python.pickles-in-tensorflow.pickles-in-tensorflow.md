---
name: oss/trailofbits.python.pickles-in-tensorflow.pickles-in-tensorflow
rubric: safety
severity: should_fix
languages: [python]
cwe: [CWE-502]
---

**Rule.** Tensorflow's low-level load function may result in arbitrary code execution.

**Why.** Reported as CWE-502: Deserialization of Untrusted Data. See https://blog.trailofbits.com/2021/03/15/never-a-dill-moment-exploiting-machine-learning-pickle-files/. Ported from opengrep rule `trailofbits.python.pickles-in-tensorflow.pickles-in-tensorflow` (generated/oss/vulns.yaml).

## Examples

Bad:

```python
tensorflow.saved_model.load(...)
```

Good:

```python
tensorflow.saved_model.load("...", ...)
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.python.pickles-in-tensorflow.pickles-in-tensorflow` (metavariables start with `$`):

- `tensorflow.saved_model.load(...)`
- `tensorflow.saved_model.load("...", ...)`
