---
name: oss/trailofbits.python.scikit-joblib-load.scikit-joblib-load
rubric: safety
severity: should_fix
languages: [python]
cwe: [CWE-502]
---

**Rule.** Scikit `joblib` uses pickle under the hood. Functions reliant on pickle can result in arbitrary code execution. Consider using `skops` instead.

**Why.** Reported as CWE-502: Deserialization of Untrusted Data. See https://scikit-learn.org/stable/model_persistence.html. Ported from opengrep rule `trailofbits.python.scikit-joblib-load.scikit-joblib-load` (generated/oss/vulns.yaml).

## Examples

Bad:

```python
joblib.load(...)
```

Good:

```python
joblib.load("...")
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.python.scikit-joblib-load.scikit-joblib-load` (metavariables start with `$`):

- `joblib.load(...)`
- `joblib.load("...")`
