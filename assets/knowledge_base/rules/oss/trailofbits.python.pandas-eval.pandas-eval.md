---
name: oss/trailofbits.python.pandas-eval.pandas-eval
rubric: safety
severity: should_fix
languages: [python]
cwe: [CWE-95]
---

**Rule.** Pandas eval() and query() may be dangerous if used to evaluate dynamic content. If this content can be input from outside the program, this may be a code injection vulnerability. Ensure evaluated content is not definable by external sources.

**Why.** Reported as CWE-95: Improper Neutralization of Directives in Dynamically Evaluated Code ('Eval Injection'). See https://blog.trailofbits.com/2021/03/15/never-a-dill-moment-exploiting-machine-learning-pickle-files/. Ported from opengrep rule `trailofbits.python.pandas-eval.pandas-eval` (generated/oss/audit.yaml).

## Examples

Bad:

```python
pandas.DataFrame.$FN(...)
pandas.$FN(...)
$DF.$FN(...)
```

Good:

```python
pandas.DataFrame.$FN("...", ...)
pandas.DataFrame.$FN(f"", ...)
pandas.$FN("...", ...)
pandas.$FN(f"", ...)
$DF.$FN("...", ...)
$DF.$FN(f"", ...)
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.python.pandas-eval.pandas-eval` (metavariables start with `$`):

- `import pandas
...`
- `pandas.DataFrame.$FN(...)`
- `pandas.DataFrame.$FN("...", ...)`
- `pandas.DataFrame.$FN(f"", ...)`
- `pandas.$FN(...)`
- `pandas.$FN("...", ...)`
- `pandas.$FN(f"", ...)`
- `$DF = pandas.DataFrame(...)
...`
- `$DF.$FN(...)`
- `$DF.$FN("...", ...)`
- `$DF.$FN(f"", ...)`
- `(eval|query)`
