---
name: oss/raptor-mismatched-memory-management-cpp
rubric: safety
severity: nit
languages: [cpp]
---

**Rule.** The software attempts to return a memory resource to the system, but it calls a release function that is not compatible with the function that was originally used to allocate that resource. Due to inherent limitations of Semgrep, this rule might generate many false positives and should therefore be customized for your codebase.

**Why.** See https://cwe.mitre.org/data/definitions/762. See https://cwe.mitre.org/data/definitions/590. See https://github.com/struct/mms. See https://docs.microsoft.com/en-us/cpp/sanitizers/asan-error-examples. Ported from opengrep rule `raptor-mismatched-memory-management-cpp` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `raptor-mismatched-memory-management-cpp` (metavariables start with `$`):

- `free($PTR);`
- `$PTR = malloc(...);
...
free($PTR);`
- `$PTR = ($CAST)malloc(...);
...
free($PTR);`
- `$PTR = calloc(...);
...
free($PTR);`
- `$PTR = ($CAST)calloc(...);
...
free($PTR);`
- `$PTR = realloc(...);
...
free($PTR);`
- `$PTR = ($CAST)realloc(...);
...
free($PTR);`
- `$PTR = strdup(...);
...
free($PTR);`
- `$PTR = strndup(...);
...
free($PTR);`
- `delete[]($PTR);`
- `$PTR = new $OBJ[$SIZE];
...
delete[]($PTR);`
- `delete($PTR);`
- `$PTR = new $OBJ;
...
delete($PTR);`
- `$PTR = new $OBJ[$SIZE];
...
delete($PTR);`
