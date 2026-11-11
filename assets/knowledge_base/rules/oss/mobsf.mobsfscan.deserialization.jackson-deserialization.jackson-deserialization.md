---
name: oss/mobsf.mobsfscan.deserialization.jackson-deserialization.jackson-deserialization
rubric: correctness
severity: should_fix
languages: [java]
cwe: [cwe-502]
---

**Rule.** The app uses jackson deserialization library. Deserialization of untrusted input can result in arbitrary code execution. Consider using HMACs to sign the data stream to make sure it is not tampered with, or consider only transmitting object fields and populating a new object.

**Why.** Reported as cwe-502. Ported from opengrep rule `mobsf.mobsfscan.deserialization.jackson_deserialization.jackson_deserialization` (generated/oss/others.yaml).

## Examples

Bad:

```java
import com.fasterxml.jackson.databind.ObjectMapper;
...
$Z.enableDefaultTyping();
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.deserialization.jackson_deserialization.jackson_deserialization` (metavariables start with `$`):

- `import com.fasterxml.jackson.databind.ObjectMapper;
...
$Z.enableDefaultTyping();`
