---
name: oss/gitlab.find-sec-bugs.INFORMATION-EXPOSURE-THROUGH-AN-ERROR-MESSAGE-1
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** The application was found printing stack information to the default system output. As stack trace data may contain sensitive information, it is recommended that the output be logged using a secure logging framework. Log files should also be protected with proper operating system permission levels.

**Why.** Reported as CWE-209. Ported from opengrep rule `gitlab.find_sec_bugs.INFORMATION_EXPOSURE_THROUGH_AN_ERROR_MESSAGE-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.INFORMATION_EXPOSURE_THROUGH_AN_ERROR_MESSAGE-1` (metavariables start with `$`):

- `catch(Throwable $E) {
  ...
  $E.printStackTrace();
  ...
}`
- `catch(Exception $E) {
  ...
  $E.printStackTrace();
  ...
}`
- `catch(Error $E) {
  ...
  $E.printStackTrace();
  ...
}`
- `catch(java.io.FileNotFoundException $E) {
  ...
  $E.printStackTrace();
  ...
}`
- `catch(java.sql.SQLException $E) {
  ...
  $E.printStackTrace();
  ...
}`
- `catch(java.net.BindException $E) {
  ...
  $E.printStackTrace();
  ...
}`
- `catch(java.util.ConcurrentModificationException $E) {
  ...
  $E.printStackTrace();
  ...
}`
- `catch(javax.naming.InsufficientResourcesException $E) {
  ...
  $E.printStackTrace();
  ...
}`
- `catch(java.util.MissingResourceException $E) {
  ...
  $E.printStackTrace();
  ...
}`
- `catch(java.util.jar.JarException $E) {
  ...
  $E.printStackTrace();
  ...
}`
- `catch(java.security.acl.NotOwnerException $E) {
  ...
  $E.printStackTrace();
  ...
}`
- `catch(OutOfMemoryError $E) {
  ...
  $E.printStackTrace();
  ...
}`
- `catch(StackOverflowError $E) {
  ...
  $E.printStackTrace();
  ...
}`
