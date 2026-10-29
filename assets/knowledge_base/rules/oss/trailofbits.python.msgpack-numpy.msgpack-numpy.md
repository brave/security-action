---
name: oss/trailofbits.python.msgpack-numpy.msgpack-numpy
rubric: safety
severity: should_fix
languages: [python]
---

**Rule.** Found usage of msgpack-numpy unpacking, which relies on pickle to deserialize numpy arrays containing objects. Functions reliant on pickle can result in arbitrary code execution. Consider switching to a safer serialization method.

**Why.** Reported as CWE-502: Deserialization of Untrusted Data. See https://blog.trailofbits.com/2021/03/15/never-a-dill-moment-exploiting-machine-learning-pickle-files/. Ported from opengrep rule `trailofbits.python.msgpack-numpy.msgpack-numpy` (generated/oss/vulns.yaml).

## Examples

Bad:

```python
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.python.msgpack-numpy.msgpack-numpy` (metavariables start with `$`):

- `msgpack.$FN(...)`
- `(loads?|dumps?|packb?|unpackb?)`
- `msgpack_numpy.patch()
...`
- `msgpack.$FN(..., object_hook=msgpack_numpy.decode, ...)`
- `unpackb?`
- `msgpack.$FN(..., default=msgpack_numpy.encode, ...)`
- `packb?`
