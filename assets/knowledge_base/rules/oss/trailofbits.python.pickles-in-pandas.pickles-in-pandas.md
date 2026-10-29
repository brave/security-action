---
name: oss/trailofbits.python.pickles-in-pandas.pickles-in-pandas
rubric: safety
severity: should_fix
languages: [python]
---

**Rule.** Functions reliant on pickle can result in arbitrary code execution. Consider using fickling or switching to a safer serialization method

**Why.** Reported as CWE-502: Deserialization of Untrusted Data. See https://blog.trailofbits.com/2021/03/15/never-a-dill-moment-exploiting-machine-learning-pickle-files/. Ported from opengrep rule `trailofbits.python.pickles-in-pandas.pickles-in-pandas` (generated/oss/vulns.yaml).

## Examples

Bad:

```python
pandas.read_pickle(...)
pandas.to_pickle(...)
$SMTH.to_pickle(...)
```

Good:

```python
pandas.read_pickle("...")
pandas.to_pickle(..., "...")
$SMTH.to_pickle("...")
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.python.pickles-in-pandas.pickles-in-pandas` (metavariables start with `$`):

- `pandas.read_pickle(...)`
- `pandas.to_pickle(...)`
- `import pandas
...`
- `$SMTH.to_pickle(...)`
- `pandas.read_pickle("...")`
- `pandas.to_pickle(..., "...")`
- `$SMTH.to_pickle("...")`
