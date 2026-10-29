---
name: oss/trailofbits.python.pickles-in-keras.pickles-in-keras
rubric: safety
severity: should_fix
languages: [python]
---

**Rule.** Keras' load_model function may result in arbitrary code execution: - It can load vulnerable pickled models - It can load an hdf5 model that contains a lambda layer with arbitrary code that will be executed every time the model is used (loading, training, eval) Note: Keras loading with the built-in file format should be safe as long as checks are not disabled.

**Why.** Reported as CWE-502: Deserialization of Untrusted Data. See https://blog.trailofbits.com/2021/03/15/never-a-dill-moment-exploiting-machine-learning-pickle-files/. Ported from opengrep rule `trailofbits.python.pickles-in-keras.pickles-in-keras` (generated/oss/vulns.yaml).

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
keras.models.load_model("...", ...)
tensorflow.keras.models.load_model("...", ...)
keras.saving.load_model("...", ...)
tensorflow.keras.saving.load_model("...", ...)
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.python.pickles-in-keras.pickles-in-keras` (metavariables start with `$`):

- `keras.models.load_model(...)`
- `keras.models.load_model("...", ...)`
- `tensorflow.keras.models.load_model(...)`
- `tensorflow.keras.models.load_model("...", ...)`
- `keras.saving.load_model(...)`
- `keras.saving.load_model("...", ...)`
- `tensorflow.keras.saving.load_model(...)`
- `tensorflow.keras.saving.load_model("...", ...)`
