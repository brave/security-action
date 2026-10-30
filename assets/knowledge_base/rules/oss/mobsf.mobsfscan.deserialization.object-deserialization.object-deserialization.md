---
name: oss/mobsf.mobsfscan.deserialization.object-deserialization.object-deserialization
rubric: correctness
severity: should_fix
languages: [java]
cwe: [cwe-502]
---

**Rule.** Found object deserialization using ObjectInputStream. Deserializing entire Java objects is dangerous because malicious actors can create Java object streams with unintended consequences. Ensure that the objects being deserialized are not user-controlled. Consider using HMACs to sign the data stream to make sure it is not tampered with, or consider only transmitting object fields and populating a new object.

**Why.** Reported as cwe-502. Ported from opengrep rule `mobsf.mobsfscan.deserialization.object_deserialization.object_deserialization` (generated/oss/others.yaml).

## Examples

Bad:

```java
new ObjectInputStream(...);
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.deserialization.object_deserialization.object_deserialization` (metavariables start with `$`):

- `new ObjectInputStream(...);`
