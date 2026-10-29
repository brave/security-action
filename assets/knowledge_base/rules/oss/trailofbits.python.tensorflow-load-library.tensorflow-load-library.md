---
name: oss/trailofbits.python.tensorflow-load-library.tensorflow-load-library
rubric: safety
severity: should_fix
languages: [python]
---

**Rule.** Loading custom operator libraries can result in arbitrary code execution

**Why.** Reported as CWE-676: Use of Potentially Dangerous Function. See https://www.tensorflow.org/api_docs/python/tf/load_library. See https://www.tensorflow.org/api_docs/python/tf/load_op_library. Ported from opengrep rule `trailofbits.python.tensorflow-load-library.tensorflow-load-library` (generated/oss/audit.yaml).

## Examples

Bad:

```python
tensorflow.load_library(...)
tensorflow.load_op_library(...)
```

Good:

```python
tensorflow.load_library("...")
tensorflow.load_op_library("...")
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.python.tensorflow-load-library.tensorflow-load-library` (metavariables start with `$`):

- `tensorflow.load_library(...)`
- `tensorflow.load_op_library(...)`
- `tensorflow.load_library("...")`
- `tensorflow.load_op_library("...")`
