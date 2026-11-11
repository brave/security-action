---
name: oss/raptor-signed-unsigned-conversion
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** The software uses a signed primitive and performs a cast to an unsigned primitive, or uses an unsigned primitive and performs a cast to a signed primitive, which can produce an unexpected value. When the result of a function is to be used as a size parameter, using negative return values can have unexpected results. Although less frequent an issue, unsigned-to-signed conversion can be the precursor to buffer underwrite conditions. Buffer underwrites occur frequently when large unsigned values are cast to signed values, and then used as indexes into a buffer or for pointer arithmetic.

**Why.** See https://cwe.mitre.org/data/definitions/195. See https://cwe.mitre.org/data/definitions/196. See https://cwe.mitre.org/data/definitions/194. See https://cwe.mitre.org/data/definitions/191. See https://cwe.mitre.org/data/definitions/681. See https://cwe.mitre.org/data/definitions/789. See https://g.co/kgs/PCHQjJ. See https://github.com/struct/mms. See https://www.sei.cmu.edu/downloads/sei-cert-c-coding-standard-2016-v01.pdf. See http://www.phrack.org/issues/60/10.html#article. See https://docs.microsoft.com/en-us/cpp/sanitizers/asan-error-examples. Ported from opengrep rule `raptor-signed-unsigned-conversion` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `raptor-signed-unsigned-conversion` (metavariables start with `$`):

- `(unsigned int $UNSIGNED) = <... (int $SIGNED) ...>`
- `(unsigned $UNSIGNED) = <... (int $SIGNED) ...>`
- `(size_t $UNSIGNED) = <... (int $SIGNED) ...>`
- `(size_t $UNSIGNED) = <... (off_t $SIGNED) ...>`
- `unsigned int $FUN(...)
{
...
return (int $SIGNED);
}`
- `unsigned $FUN(...)
{
...
return (int $SIGNED);
}`
- `size_t $FUN(...)
{
...
return (int $SIGNED);
}`
- `size_t $FUN(...)
{
...
return (off_t $SIGNED);
}`
- `strncpy($DST, $SRC, (int $LEN))`
- `stpncpy($DST, $SRC, (int $LEN))`
- `strncat($DST, $SRC, (int $LEN))`
- `strlcpy($DST, $SRC, (int $LEN))`
- `strscpy($DST, $SRC, (int $LEN))`
- `strlcat($DST, $SRC, (int $LEN))`
- `snprintf($BUF, (int $LEN), ...)`
- `vsnprintf($BUF, (int $LEN), ...)`
- `getcwd($BUF, (int $LEN))`
- `memcpy($DST, $SRC, (int $LEN))`
- `memccpy($DST, $SRC, $CHAR, (int $LEN))`
- `memmove($DST, $SRC, (int $LEN))`
- `memset($DST, $CHAR, (int $LEN))`
- `bcopy($SRC, $DST, (int $LEN))`
- `alloca((int $LEN))`
- `malloc((int $LEN))`
- `calloc($CNT, (int $LEN))`
- `calloc((int $CNT), $LEN)`
- `realloc($PTR, (int $LEN))`
- `read($FD, $BUF, (int $LEN))`
- `recv($SD, $BUF, (int $LEN), $FL)`
- `recvfrom($SD, $BUF, (int $LEN), $FL, ...)`
- `fread($PTR, (int $LEN), $NITEMS, $FS)`
- `(int $SIGNED) = <... (unsigned int $UNSIGNED) ...>`
- `(int $SIGNED) = <... (unsigned $UNSIGNED) ...>`
- `(int $SIGNED) = <... (size_t $UNSIGNED) ...>`
- `(off_t $SIGNED) = <... (size_t $UNSIGNED) ...>`
- `int $FUN(...)
{
...
return (unsigned int $UNSIGNED);
}`
- `int $FUN(...)
{
...
return (unsigned $UNSIGNED);
}`
- `int $FUN(...)
{
...
return (size_t $UNSIGNED);
}`
- `off_t $FUN(...)
{
...
return (size_t $UNSIGNED);
}`
