---
name: oss/trailofbits.python.pickles-in-keras-deprecation.pickles-in-keras-deprecation
rubric: safety
severity: should_fix
languages: [python]
---

**Rule.** The usage of pickle and hdf5 formats for model files are deprecated in Keras. The keras.models.load_model function is deprecated as well. Keras is now embedded in Tensorflow 2 under tensorflow.keras.

**Why.** Reported as CWE-502: Deserialization of Untrusted Data. See https://blog.trailofbits.com/2021/03/15/never-a-dill-moment-exploiting-machine-learning-pickle-files/. Ported from opengrep rule `trailofbits.python.pickles-in-keras-deprecation.pickles-in-keras-deprecation` (generated/oss/vulns.yaml).

## Examples

Bad:

```python
keras.models.load_model(...)
tensorflow.keras.models.load_model(...)
keras.saving.load_model(...)
tensorflow.keras.saving.load_model(...)
```

Good:

```python
keras.models.load_model($FILE)
tensorflow.keras.models.load_model($FILE)
keras.saving.load_model($FILE)
tensorflow.keras.saving.load_model($FILE)
.*\.keras
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.python.pickles-in-keras-deprecation.pickles-in-keras-deprecation` (metavariables start with `$`):

- `keras.models.load_model(...)`
- `tensorflow.keras.models.load_model(...)`
- `keras.saving.load_model(...)`
- `tensorflow.keras.saving.load_model(...)`
- `keras.models.load_model($FILE)`
- `tensorflow.keras.models.load_model($FILE)`
- `keras.saving.load_model($FILE)`
- `tensorflow.keras.saving.load_model($FILE)`
- `.*\.keras`
