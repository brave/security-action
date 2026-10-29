---
name: oss/mobsf.mobsfscan.crypto.sha1-hash.sha1-hash
rubric: correctness
severity: should_fix
languages: [java]
---

**Rule.** SHA1 Hash algorithm used. The SHA1 hash is known to have hash collisions.

**Why.** Reported as cwe-327. Ported from opengrep rule `mobsf.mobsfscan.crypto.sha1_hash.sha1_hash` (generated/oss/others.yaml).

## Examples

Bad:

```java
$C.getInstance("=~/sha-1|sha1/i", ...);
DigestUtils.sha1Hex(...);
DigestUtils.sha1(...);
DigestUtils.sha(...);
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.crypto.sha1_hash.sha1_hash` (metavariables start with `$`):

- `$C.getInstance("=~/sha-1|sha1/i", ...);`
- `DigestUtils.sha1Hex(...);`
- `DigestUtils.sha1(...);`
- `DigestUtils.sha(...);`
