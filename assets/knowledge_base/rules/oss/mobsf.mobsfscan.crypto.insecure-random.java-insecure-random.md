---
name: oss/mobsf.mobsfscan.crypto.insecure-random.java-insecure-random
rubric: correctness
severity: should_fix
languages: [java]
---

**Rule.** The App uses an insecure Random Number Generator.

**Why.** Reported as cwe-330. Ported from opengrep rule `mobsf.mobsfscan.crypto.insecure_random.java_insecure_random` (generated/oss/others.yaml).

## Examples

Bad:

```java
import java.util.Random;
import java.util.concurrent.ThreadLocalRandom;
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.crypto.insecure_random.java_insecure_random` (metavariables start with `$`):

- `import java.util.Random;`
- `import java.util.concurrent.ThreadLocalRandom;`
