---
name: oss/trailofbits.python.tarfile-extractall-traversal.tarfile-extractall-traversal
rubric: safety
severity: should_fix
languages: [python]
cwe: [CWE-22]
---

**Rule.** Possible path traversal through `tarfile.open($PATH).extractall()` if the source tar is controlled by an attacker

**Why.** Reported as CWE-22: Improper Limitation of a Pathname to a Restricted Directory ('Path Traversal'). See https://docs.python.org/3/library/tarfile.html#tarfile.TarFile.extractall. Ported from opengrep rule `trailofbits.python.tarfile-extractall-traversal.tarfile-extractall-traversal` (generated/oss/vulns.yaml).

## Examples

Bad:

```python
with tarfile.open(...) as $TAR:
    ...
    $TAR.extractall(...)
tarfile.open(...).extractall(...)
$TAR = tarfile.open(...)
...
$TAR.extractall(...)
```

Good:

```python
with tarfile.open(...) as $TAR:
    ...
    $TAR.extractall(..., members=$MEMBERS, ...)
tarfile.open(...).extractall(..., members=$MEMBERS, ...)
$TAR = tarfile.open(...)
...
$TAR.extractall(..., members=$MEMBERS, ...)
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.python.tarfile-extractall-traversal.tarfile-extractall-traversal` (metavariables start with `$`):

- `with tarfile.open(...) as $TAR:
    ...
    $TAR.extractall(...)`
- `tarfile.open(...).extractall(...)`
- `$TAR = tarfile.open(...)
...
$TAR.extractall(...)`
- `with tarfile.open(...) as $TAR:
    ...
    $TAR.extractall(..., members=$MEMBERS, ...)`
- `tarfile.open(...).extractall(..., members=$MEMBERS, ...)`
- `$TAR = tarfile.open(...)
...
$TAR.extractall(..., members=$MEMBERS, ...)`
