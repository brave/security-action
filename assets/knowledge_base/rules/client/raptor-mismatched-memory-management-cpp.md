---
name: client/raptor-mismatched-memory-management-cpp
rubric: safety
severity: nit
languages: [cpp]
cwe: [CWE-762]
---

**Rule.** The software attempts to return a memory resource to the system, but it calls a release function that is not compatible with the function that was originally used to allocate that resource. When the memory management functions are mismatched, the consequences may be as severe as code execution, memory corruption, or program crash. Consequences and ease of exploit will vary depending on the implementation of the routines and the object being managed. Due to inherent limitations of Semgrep, this rule might generate many false positives and should therefore be customized for your codebase.

**Why.** Reported as CWE-762: Mismatched Memory Management Routines. See https://cwe.mitre.org/data/definitions/762. See https://cwe.mitre.org/data/definitions/590. See https://github.com/struct/mms. See https://docs.microsoft.com/en-us/cpp/sanitizers/asan-error-examples. Ported from opengrep rule `raptor-mismatched-memory-management-cpp` (client/mismatched-memory-management-cpp.yaml).

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
- `delete[](this);`
- `.`
- `delete($PTR);`
- `$PTR = new $OBJ;
...
delete($PTR);`
- `delete(this);`
- `$PTR = new $OBJ[$SIZE];
...
delete($PTR);`
