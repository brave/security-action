---
name: oss/mobsf.mobsfscan.crypto.cbc-static-iv.cbc-static-iv
rubric: correctness
severity: should_fix
languages: [java]
cwe: [cwe-329]
---

**Rule.** The IV for AES CBC mode should be random. A static IV makes the ciphertext vulnerable to Chosen Plaintext Attack.

**Why.** Reported as cwe-329. Ported from opengrep rule `mobsf.mobsfscan.crypto.cbc_static_iv.cbc_static_iv` (generated/oss/others.yaml).

## Examples

Bad:

```java
byte[] $X = {...};
...
$Y =  new IvParameterSpec($X, ...);
...
$C.getInstance("=~/AES/CBC.*/i");
byte[] $X = "...".$FUNC(...);
...
$Y =  new IvParameterSpec($X, ...);
...
$C.getInstance("=~/AES/CBC.*/i");
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.crypto.cbc_static_iv.cbc_static_iv` (metavariables start with `$`):

- `byte[] $X = {...};
...
$Y =  new IvParameterSpec($X, ...);
...
$C.getInstance("=~/AES/CBC.*/i");`
- `byte[] $X = "...".$FUNC(...);
...
$Y =  new IvParameterSpec($X, ...);
...
$C.getInstance("=~/AES/CBC.*/i");`
