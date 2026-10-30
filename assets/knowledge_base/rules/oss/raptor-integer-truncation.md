---
name: oss/raptor-integer-truncation
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** Truncation errors occur when a primitive is cast to a primitive of a smaller size and data is lost in the conversion. The value cannot be trusted and the application will be in an undefined state.

**Why.** See https://cwe.mitre.org/data/definitions/197. See https://cwe.mitre.org/data/definitions/681. See https://g.co/kgs/PCHQjJ. See https://github.com/struct/mms. Ported from opengrep rule `raptor-integer-truncation` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `raptor-integer-truncation` (metavariables start with `$`):

- `(char $NARROW) = <... (short $LARGE) ...>`
- `(char $NARROW) = <... (short int $LARGE) ...>`
- `(char $NARROW) = <... (unsigned short $LARGE) ...>`
- `(char $NARROW) = <... (unsigned short int $LARGE) ...>`
- `(char $NARROW) = <... (int $LARGE) ...>`
- `(char $NARROW) = <... (unsigned $LARGE) ...>`
- `(char $NARROW) = <... (unsigned int $LARGE) ...>`
- `(char $NARROW) = <... (long $LARGE) ...>`
- `(char $NARROW) = <... (long int $LARGE) ...>`
- `(char $NARROW) = <... (unsigned long $LARGE) ...>`
- `(char $NARROW) = <... (unsigned long int $LARGE) ...>`
- `char $FUN(...)
{
...
return (short $LARGE);
}`
- `char $FUN(...)
{
...
return (int $LARGE);
}`
- `char $FUN(...)
{
...
return (long $LARGE);
}`
- `(short $NARROW) = <... (unsigned short $LARGE) ...>`
- `(short int $NARROW) = <... (unsigned short int $LARGE) ...>`
- `(short $NARROW) = <... (int $LARGE) ...>`
- `(short $NARROW) = <... (unsigned $LARGE) ...>`
- `(short int $NARROW) = <... (unsigned int $LARGE) ...>`
- `(short $NARROW) = <... (long $LARGE) ...>`
- `(short int $NARROW) = <... (long int $LARGE) ...>`
- `(short $NARROW) = <... (unsigned long $LARGE) ...>`
- `(short int $NARROW) = <... (unsigned long int $LARGE) ...>`
- `(unsigned short $NARROW) = <... (int $LARGE) ...>`
- `(unsigned short $NARROW) = <... (unsigned $LARGE) ...>`
- `(unsigned short int $NARROW) = <... (unsigned int $LARGE) ...>`
- `(unsigned short $NARROW) = <... (long $LARGE) ...>`
- `(unsigned short int $NARROW) = <... (long int $LARGE) ...>`
- `(unsigned short $NARROW) = <... (unsigned long $LARGE) ...>`
- `(unsigned short int $NARROW) = <... (unsigned long int $LARGE) ...>`
- `short $FUN(...)
{
...
return (int $LARGE);
}`
- `short $FUN(...)
{
...
return (long $LARGE);
}`
- `(int $NARROW) = <... (unsigned $LARGE) ...>`
- `(int $NARROW) = <... (unsigned int $LARGE) ...>`
- `(int $NARROW) = <... (long $LARGE) ...>`
- `(int $NARROW) = <... (long int $LARGE) ...>`
- `(int $NARROW) = <... (unsigned long $LARGE) ...>`
- `(int $NARROW) = <... (unsigned long int $LARGE) ...>`
- `int $FUN(...)
{
...
return (long $LARGE);
}`
- `(long $NARROW) = <... (unsigned long $LARGE) ...>`
- `(long int $NARROW) = <... (unsigned long int $LARGE) ...>`
