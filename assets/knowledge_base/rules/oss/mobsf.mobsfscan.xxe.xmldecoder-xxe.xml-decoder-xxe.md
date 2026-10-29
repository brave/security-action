---
name: oss/mobsf.mobsfscan.xxe.xmldecoder-xxe.xml-decoder-xxe
rubric: correctness
severity: should_fix
languages: [java]
---

**Rule.** XMLDecoder should not be used to parse untrusted data. Deserializing user input can lead to arbitrary code execution. Use an alternative and explicitly disable external entities.

**Why.** Reported as cwe-611. Ported from opengrep rule `mobsf.mobsfscan.xxe.xmldecoder_xxe.xml_decoder_xxe` (generated/oss/others.yaml).

## Examples

Bad:

```java
$X $METHOD(...) {
  ...
  new XMLDecoder(...);
  ...
}
```

Good:

```java
$X $METHOD(...) {
  ...
  new XMLDecoder("...");
  ...
}
$X $METHOD(...) {
  ...
  String $STR = "...";
  ...
  new XMLDecoder($STR);
  ...
}
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.xxe.xmldecoder_xxe.xml_decoder_xxe` (metavariables start with `$`):

- `$X $METHOD(...) {
  ...
  new XMLDecoder(...);
  ...
}`
- `$X $METHOD(...) {
  ...
  new XMLDecoder("...");
  ...
}`
- `$X $METHOD(...) {
  ...
  String $STR = "...";
  ...
  new XMLDecoder($STR);
  ...
}`
