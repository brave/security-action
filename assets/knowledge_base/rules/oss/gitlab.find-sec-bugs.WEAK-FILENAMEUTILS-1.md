---
name: oss/gitlab.find-sec-bugs.WEAK-FILENAMEUTILS-1
rubric: safety
severity: should_fix
languages: [java]
cwe: [CWE-22]
---

**Rule.** The filename provided by the FileUpload API can be tampered with by the client to reference unauthorized files. The provided filename should be properly validated to ensure it's properly structured, contains no unauthorized path characters (e.g., / \), and refers to an authorized file. The application was found to take a parameter from user input to construct a path name. If an unfiltered parameter is passed to this file API, files from an arbitrary filesystem location could be read. When data from an unstrusted source is untrusted source is used to construct a file path, an attacker could potentially gain access to restrcited files locations outside the relevant context. For example, if the application tries to access the users profile picture based on their user name by concatenating the username to the filepath: "images/userprofiles/" + username The expected result of this would be "images/userprofiles/alice", however an attacker could use a malicious input such as "../../../etc/passwd" to gain access to and/or manipulate sensitive information Assume all input is malicious. Use an "accept known good" input validation strategy. Inputs can be sanitized by using the getName() method with concat() method to remove the potentially malicious path traversal and limit the scope to a restricted directory. Or input can also be sanitized by using resolve() method alongwith startsWith() method to verify that the base path of the file is safe and expected. Example of limiting path traversal using getName: ``` protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException { String input = req.getHeader("input"); input = getName(input); String safePath = concat(basePath, input); // Read the contents of the file File file = new File(safePath); } ```

**Why.** Reported as CWE-22. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs.WEAK_FILENAMEUTILS-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// untrusted input (source)
(HttpServletRequest $REQ)
// flows to sink without sanitization
org.apache.commons.io.FilenameUtils.concat(...)
org.apache.commons.io.FilenameUtils.getFullPath(...)
org.apache.commons.io.FilenameUtils.getFullPathNoEndSeparator(...)
org.apache.commons.io.FilenameUtils.getPath(...)
org.apache.commons.io.FilenameUtils.getPathNoEndSeparator(...)
org.apache.commons.io.FilenameUtils.normalize(...)
org.apache.commons.io.FilenameUtils.normalizeNoEndSeparator(...)
org.apache.commons.io.FilenameUtils.removeExtension(...)
org.apache.commons.io.FilenameUtils.separatorsToSystem(...)
org.apache.commons.io.FilenameUtils.separatorsToUnix(...)
org.apache.commons.io.FilenameUtils.separatorsToWindows(...)
```

Good:

```java
$NAME = org.apache.commons.io.FilenameUtils.getName(...);
...
$SAFE = concat($BASE, $NAME);
$RET $FUN(...){
  ...
  $PATH = $BP.resolve(...);
  ...
  if(!$PATH.startsWith(...)) {
    throw new $EXC(...);
  }
  ...
}
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.WEAK_FILENAMEUTILS-1` (metavariables start with `$`):

- `$NAME = org.apache.commons.io.FilenameUtils.getName(...);
...
$SAFE = concat($BASE, $NAME);`
- `$RET $FUN(...){
  ...
  $PATH = $BP.resolve(...);
  ...
  if(!$PATH.startsWith(...)) {
    throw new $EXC(...);
  }
  ...
}`
- `(HttpServletRequest $REQ)`
- `org.apache.commons.io.FilenameUtils.concat(...)`
- `org.apache.commons.io.FilenameUtils.getFullPath(...)`
- `org.apache.commons.io.FilenameUtils.getFullPathNoEndSeparator(...)`
- `org.apache.commons.io.FilenameUtils.getPath(...)`
- `org.apache.commons.io.FilenameUtils.getPathNoEndSeparator(...)`
- `org.apache.commons.io.FilenameUtils.normalize(...)`
- `org.apache.commons.io.FilenameUtils.normalizeNoEndSeparator(...)`
- `org.apache.commons.io.FilenameUtils.removeExtension(...)`
- `org.apache.commons.io.FilenameUtils.separatorsToSystem(...)`
- `org.apache.commons.io.FilenameUtils.separatorsToUnix(...)`
- `org.apache.commons.io.FilenameUtils.separatorsToWindows(...)`
