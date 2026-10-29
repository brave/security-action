---
name: oss/mobsf.mobsfscan.crypto.weak-key-size.weak-key-size
rubric: correctness
severity: should_fix
languages: [java]
---

**Rule.** Cryptographic implementations with insufficient key length is susceptible to bruteforce attacks.

**Why.** Reported as cwe-326. Ported from opengrep rule `mobsf.mobsfscan.crypto.weak_key_size.weak_key_size` (generated/oss/others.yaml).

## Examples

Bad:

```java
$K = $G.getInstance("RSA");
...
$K.initialize(1024);
$K = $G.getInstance("RSA");
...
$K.initialize(512);
$K = $G.getInstance("EC");
...
$K.initialize(new ECGenParameterSpec("secp112r1"));
$K = $G.getInstance("EC");
...
$S = new ECGenParameterSpec("secp112r1");
...
$K.initialize($S);
$K = $G.getInstance("EC");
...
$K.initialize(new ECGenParameterSpec("secp224r1"));
$K = $G.getInstance("EC");
...
$S = new ECGenParameterSpec("secp224r1");
...
$K.initialize($S);
$K = $G.getInstance("Blowfish");
...
$K.init(64);
$K = $G.getInstance("AES");
...
$K.init(64);
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.crypto.weak_key_size.weak_key_size` (metavariables start with `$`):

- `$K = $G.getInstance("RSA");
...
$K.initialize(1024);`
- `$K = $G.getInstance("RSA");
...
$K.initialize(512);`
- `$K = $G.getInstance("EC");
...
$K.initialize(new ECGenParameterSpec("secp112r1"));`
- `$K = $G.getInstance("EC");
...
$S = new ECGenParameterSpec("secp112r1");
...
$K.initialize($S);`
- `$K = $G.getInstance("EC");
...
$K.initialize(new ECGenParameterSpec("secp224r1"));`
- `$K = $G.getInstance("EC");
...
$S = new ECGenParameterSpec("secp224r1");
...
$K.initialize($S);`
- `$K = $G.getInstance("Blowfish");
...
$K.init(64);`
- `$K = $G.getInstance("AES");
...
$K.init(64);`
