---
name: oss/trailofbits.rs.panic-in-function-returning-result.panic-in-function-returning-re-108d4zx
rubric: safety
severity: should_fix
languages: [rust]
cwe: [CWE-755]
---

**Rule.** `expect` or `unwrap` called in function returning a `Result`

**Why.** Reported as CWE-755: Improper Handling of Exceptional Conditions. See https://doc.rust-lang.org/std/result/. Ported from opengrep rule `trailofbits.rs.panic-in-function-returning-result.panic-in-function-returning-result` (generated/oss/audit.yaml).

## Examples

Bad:

```rust
$EXPR.unwrap()
$EXPR.expect(...)
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.rs.panic-in-function-returning-result.panic-in-function-returning-result` (metavariables start with `$`):

- `$EXPR.unwrap()`
- `$EXPR.expect(...)`
- `fn $FUNC(...) -> Result<$T1, $T2> {
    ...
}`
- `fn $FUNC(...) -> Result<$T> {
    ...
}`
- `fn $FUNC(...) -> $RETTYPE {
    ...
}`
- `type $RETTYPE = Result<$T>;
...
fn $FUNC(...) -> $RETTYPE {
    ...
}`
- `type $RETTYPE = Result<$T1, $T2>;
...
fn $FUNC(...) -> $RETTYPE {
    ...
}`
