---
name: oss/gitlab.find-sec-bugs.BAD-HEXA-CONVERSION-1
rubric: safety
severity: should_fix
languages: [java]
cwe: [CWE-704]
---

**Rule.** The application is using `Integer.toHexString` on a digest array buffer which may lead to an incorrect version of values. Consider using the `java.util.HexFormat` object introduced in Java 17. For older Java applications consider using the `javax.xml.bind.DatatypeConverter`. Example using `HexFormat` to create a human-readable string: ``` // Create a MessageDigest using the SHA-384 algorithm MessageDigest sha384Digest = MessageDigest.getInstance("SHA-384"); // Call update with your data sha384Digest.update("some input".getBytes(StandardCharsets.UTF_8)); // Only call digest once all data has been fed into the update sha384digest instance byte[] output = sha384Digest.digest(); // Create a JDK 17 HexFormat object HexFormat hex = HexFormat.of(); // Use formatHex on the byte array to create a string (note that alphabet characters are lowercase) String hexString = hex.formatHex(output); ``` For more information on DatatypeConverter see: https://docs.oracle.com/javase/9/docs/api/javax/xml/bind/DatatypeConverter.html#printHexBinary-byte:A-

**Why.** Reported as CWE-704. Ported from opengrep rule `gitlab.find_sec_bugs.BAD_HEXA_CONVERSION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
for(...) {
  ...
  $B = $B_ARR[...];
  ...
  Integer.toHexString($B);
}
for(...) {
  ...
  Integer.toHexString($B_ARR[...]);
}
for(byte $B :$B_ARR) {
  ...
  Integer.toHexString($B);
}
while(...) {
  ...
  Integer.toHexString($B_ARR[...])
}
do {
  ...
  Integer.toHexString($B_ARR[...])
} while(...)
while(...) {
  ...
  $B = $B_ARR[...];
  ...
  Integer.toHexString($B);
}
do {
  ...
  $B = $B_ARR[...];
  ...
  Integer.toHexString($B);
} while(...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.BAD_HEXA_CONVERSION-1` (metavariables start with `$`):

- `$B_ARR = (java.security.MessageDigest $MD).digest(...);
...`
- `for(...) {
  ...
  $B = $B_ARR[...];
  ...
  Integer.toHexString($B);
}`
- `for(...) {
  ...
  Integer.toHexString($B_ARR[...]);
}`
- `for(byte $B :$B_ARR) {
  ...
  Integer.toHexString($B);
}`
- `while(...) {
  ...
  Integer.toHexString($B_ARR[...])
}`
- `do {
  ...
  Integer.toHexString($B_ARR[...])
} while(...)`
- `while(...) {
  ...
  $B = $B_ARR[...];
  ...
  Integer.toHexString($B);
}`
- `do {
  ...
  $B = $B_ARR[...];
  ...
  Integer.toHexString($B);
} while(...)`
