---
name: oss/mobsf.mobsfscan.crypto.weak-iv.weak-iv
rubric: correctness
severity: should_fix
languages: [java]
cwe: [cwe-1204]
---

**Rule.** The App may use weak IVs like "0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00" or "0x01,0x02,0x03,0x04,0x05,0x06,0x07". Not using a random IV makes the resulting ciphertext much more predictable and susceptible to a dictionary attack.

**Why.** Reported as cwe-1204. Ported from opengrep rule `mobsf.mobsfscan.crypto.weak_iv.weak_iv` (generated/oss/others.yaml).

## Examples

Bad:

```java
byte[] $X = {
  0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00
};
...
$Y =  new IvParameterSpec($X, ...);
byte[] $X = {
  0x01,0x02,0x03,0x04,0x05,0x06,0x07
};
...
$Y =  new IvParameterSpec($X, ...);
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.crypto.weak_iv.weak_iv` (metavariables start with `$`):

- `byte[] $X = {
  0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00
};
...
$Y =  new IvParameterSpec($X, ...);`
- `byte[] $X = {
  0x01,0x02,0x03,0x04,0x05,0x06,0x07
};
...
$Y =  new IvParameterSpec($X, ...);`
