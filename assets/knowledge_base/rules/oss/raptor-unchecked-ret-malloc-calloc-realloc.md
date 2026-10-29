---
name: oss/raptor-unchecked-ret-malloc-calloc-realloc
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** The software does not check the return value from a method or function, which can prevent it from detecting unexpected states and conditions.

**Why.** See https://cwe.mitre.org/data/definitions/252. See https://cwe.mitre.org/data/definitions/690. See https://g.co/kgs/PCHQjJ. See https://github.com/struct/mms. See https://www.sei.cmu.edu/downloads/sei-cert-c-coding-standard-2016-v01.pdf. Ported from opengrep rule `raptor-unchecked-ret-malloc-calloc-realloc` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
$RET = $FUN(...)
$RET = ($CAST)$FUN(...)
malloc
calloc
realloc
reallocf
valloc
aligned_alloc
strdup
strndup
```

Good:

```cpp
$FUN(...);
...
if (<... $RET == NULL ...>) ...
$FUN(...);
...
if (<... NULL == $RET ...>) ...
$FUN(...);
...
if (<... $RET != NULL ...>) ...
$FUN(...);
...
if (<... NULL != $RET ...>) ...
$FUN(...);
...
if (<... !$RET ...>) ...
$FUN(...);
...
if (<... $RET ...>) ...
<... $ALLOC == NULL ...>
<... NULL == $ALLOC ...>
<... $ALLOC != NULL ...>
<... NULL != $ALLOC ...>
<... !$ALLOC ...>
```

## Detection hints

Literal patterns from opengrep rule `raptor-unchecked-ret-malloc-calloc-realloc` (metavariables start with `$`):

- `$RET = $FUN(...)`
- `$RET = ($CAST)$FUN(...)`
- `malloc`
- `calloc`
- `realloc`
- `reallocf`
- `valloc`
- `aligned_alloc`
- `strdup`
- `strndup`
- `$FUN(...);
...
if (<... $RET == NULL ...>) ...`
- `$FUN(...);
...
if (<... NULL == $RET ...>) ...`
- `$FUN(...);
...
if (<... $RET != NULL ...>) ...`
- `$FUN(...);
...
if (<... NULL != $RET ...>) ...`
- `$FUN(...);
...
if (<... !$RET ...>) ...`
- `$FUN(...);
...
if (<... $RET ...>) ...`
- `<... $ALLOC == NULL ...>`
- `<... NULL == $ALLOC ...>`
- `<... $ALLOC != NULL ...>`
- `<... NULL != $ALLOC ...>`
- `<... !$ALLOC ...>`
