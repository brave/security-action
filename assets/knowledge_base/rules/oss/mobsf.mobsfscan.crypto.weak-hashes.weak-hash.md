---
name: oss/mobsf.mobsfscan.crypto.weak-hashes.weak-hash
rubric: correctness
severity: should_fix
languages: [java]
cwe: [cwe-327]
---

**Rule.** Weak Hash algorithm used. The hash algorithm is known to have hash collisions.

**Why.** Reported as cwe-327. Ported from opengrep rule `mobsf.mobsfscan.crypto.weak_hashes.weak_hash` (generated/oss/others.yaml).

## Examples

Bad:

```java
$C.getInstance("=~/md5|md4/i", ...);
$C.Files.hash(..., Hashing.md5());
Files.hash(..., Hashing.md5());
DigestUtils.md5Hex(...);
DigestUtils.md5(...);
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.crypto.weak_hashes.weak_hash` (metavariables start with `$`):

- `$C.getInstance("=~/md5|md4/i", ...);`
- `$C.Files.hash(..., Hashing.md5());`
- `Files.hash(..., Hashing.md5());`
- `DigestUtils.md5Hex(...);`
- `DigestUtils.md5(...);`
