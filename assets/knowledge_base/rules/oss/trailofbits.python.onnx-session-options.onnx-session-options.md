---
name: oss/trailofbits.python.onnx-session-options.onnx-session-options
rubric: safety
severity: should_fix
languages: [python]
cwe: [CWE-676]
---

**Rule.** Loading custom operator libraries can result in arbitrary code execution

**Why.** Reported as CWE-676: Use of Potentially Dangerous Function. See https://onnxruntime.ai/docs/reference/operators/add-custom-op.html. Ported from opengrep rule `trailofbits.python.onnx-session-options.onnx-session-options` (generated/oss/audit.yaml).

## Examples

Bad:

```python
$SESSION.register_custom_ops_library(...)
```

Good:

```python
$SESSION.register_custom_ops_library("...")
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.python.onnx-session-options.onnx-session-options` (metavariables start with `$`):

- `$SESSION = onnxruntime.SessionOptions(...)
...`
- `$SESSION.register_custom_ops_library(...)`
- `$SESSION.register_custom_ops_library("...")`
