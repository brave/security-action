---
name: client/raptor-signed-unsigned-conversion
rubric: safety
severity: should_fix
languages: [c, cpp]
cwe: [CWE-195]
---

**Rule.** The software uses a signed primitive and performs a cast to an unsigned primitive, or uses an unsigned primitive and performs a cast to a signed primitive, which can produce an unexpected value if the value of the signed primitive cannot be represented using an unsigned primitive, or if the value of the unsigned primitive cannot be represented using a signed primitive. It is dangerous to rely on implicit casts between signed and unsigned numbers because the result can take on an unexpected value and violate assumptions made by the program. Often, functions will return negative values to indicate a failure. When the result of a function is to be used as a size parameter, using these negative return values can have unexpected results. For example, if negative size values are passed to the standard memory copy or allocation functions they will be implicitly cast to a large unsigned value. This may lead to an exploitable buffer overflow or underflow condition. Although less frequent an issue than signed-to-unsigned conversion, unsigned-to-signed conversion can be the perfect precursor to dangerous buffer underwrite conditions that allow attackers to move down the stack where they otherwise might not have access in a normal buffer overflow condition. Buffer underwrites occur frequently when large unsigned values are cast to signed values, and then used as indexes into a buffer or for pointer arithmetic.

**Why.** Reported as CWE-195: Signed to Unsigned Conversion Error. See https://cwe.mitre.org/data/definitions/195. See https://cwe.mitre.org/data/definitions/196. See https://cwe.mitre.org/data/definitions/194. See https://cwe.mitre.org/data/definitions/191. See https://cwe.mitre.org/data/definitions/681. See https://cwe.mitre.org/data/definitions/789. See https://g.co/kgs/PCHQjJ. See https://github.com/struct/mms. See https://www.sei.cmu.edu/downloads/sei-cert-c-coding-standard-2016-v01.pdf. See http://www.phrack.org/issues/60/10.html#article. See https://docs.microsoft.com/en-us/cpp/sanitizers/asan-error-examples. Ported from opengrep rule `raptor-signed-unsigned-conversion` (client/signed-unsigned-conversion.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `raptor-signed-unsigned-conversion` (metavariables start with `$`):

- `(unsigned int $UNSIGNED) = <... (int $SIGNED) ...>`
- `unsigned int $FUN(...)
{
...
return (int $SIGNED);
}`
- `(unsigned $UNSIGNED) = <... (int $SIGNED) ...>`
- `unsigned $FUN(...)
{
...
return (int $SIGNED);
}`
- `(size_t $UNSIGNED) = <... (int $SIGNED) ...>`
- `size_t $FUN(...)
{
...
return (int $SIGNED);
}`
- `(size_t $UNSIGNED) = <... (off_t $SIGNED) ...>`
- `size_t $FUN(...)
{
...
return (off_t $SIGNED);
}`
- `strncpy($DST, $SRC, (int $LEN))`
- `stpncpy($DST, $SRC, (int $LEN))`
- `strncat($DST, $SRC, (int $LEN))`
- `strlcpy($DST, $SRC, (int $LEN))`
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
- `(int $SIGNED) = <... (unsigned int $UNSIGNED) ...>`
- `int $FUN(...)
{
...
return (unsigned int $UNSIGNED);
}`
- `(int $SIGNED) = <... (unsigned $UNSIGNED) ...>`
- `int $FUN(...)
{
...
return (unsigned $UNSIGNED);
}`
- `(int $SIGNED) = <... (size_t $UNSIGNED) ...>`
- `int $FUN(...)
{
...
return (size_t $UNSIGNED);
}`
- `(off_t $SIGNED) = <... (size_t $UNSIGNED) ...>`
- `off_t $FUN(...)
{
...
return (size_t $UNSIGNED);
}`
