---
name: oss/gitlab.find-sec-bugs.PT-ABSOLUTE-PATH-TRAVERSAL-1
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** The application dynamically constructs file or path information. If the path information comes from user input, it could be abused to read sensitive files, access other users' data, or aid in exploitation to gain further system access. User input should never be used in constructing paths or files for interacting with the filesystem. This includes filenames supplied by user uploads or downloads. If possible, consider hashing user input or replacing it with unique values and use `Path.resolve` to resolve and validate the path information prior to processing any file functionality. Example using `Path.resolve` and not allowing direct user input: ``` // Class to store our user data along with a randomly generated file name public static class UserData { private String userFileNameUnsafe; private String fileName; public UserData(String userFileName) { this.userFileNameUnsafe = userFileName; // Generate a random ID for the filename this.fileName = UUID.randomUUID().toString(); } public String getUserFileNameUnsafe() { return userFileNameUnsafe; }; public String getFileName() { return fileName; }; } public static void main(String[] args) throws Exception { // User input, saved only as a reference UserData userData = new UserData("..\\test.txt"); // Restrict all file processing to this directory only String base = "/var/app/restricted"; Path basePath = Paths.get(base); // Resolve the full path, but only use our random generated filename Path fullPath = basePath.resolve(userData.getFileName()); // verify the path is contained within our basePath if (!fullPath.startsWith(base)) { throw new Exception("Invalid path specified!"); } // process / work with file } ``` For more information on path traversal issues see OWASP: https://owasp.org/www-community/attacks/Path_Traversal

**Why.** Reported as CWE-22. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs.PT_ABSOLUTE_PATH_TRAVERSAL-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// untrusted input (source)
(javax.servlet.http.HttpServletRequest $R).$METHOD(...)
(java.util.Scanner $S).$METHOD(...)
(java.util.stream.Stream).$METHOD(...)
(java.util.StringJoiner $SJ).toString(...)
(java.sql.ResultSet.getString $R).$METHOD(...)
(java.lang.System $S).getProperty(...)
(java.lang.System $S).getenv(...)
(java.lang.StringBuilder $SB).toString(...)
(java.io.FileInputStream $F).read(...)
(java.io.FileReader $F).read(...)
(java.net.Socket $S).getInputStream(...)
(java.net.Socket $S).getOutputStream(...)
(java.net.DatagramSocket $S).receive(...)
(java.net.DatagramSocket $S).getInputStream(...)
java.nio.file.Files.readAllBytes(...)
java.nio.file.Files.readAllLines(...)
java.nio.file.Files.lines(...)
java.nio.file.Files.newBufferedReader(...)
org.apache.commons.io.IOUtils.toString(...)
org.apache.commons.io.IOUtils.readLines(...)
org.apache.commons.io.IOUtils.toByteArray(...)
(com.fasterxml.jackson.databind.ObjectMapper $OM).readValue(...)
(com.fasterxml.jackson.databind.ObjectMapper $OM).treeToValue(...)
$CLASS.$METHOD(..., (javax.servlet.http.HttpServletRequest $R), ...)
$FUNC(..., (javax.servlet.http.HttpServletRequest $R), ...)
// flows to sink without sanitization
$VAR
$INPUT
new java.io.FileReader(...)
new javax.activation.FileDataSource(...)
new java.io.FileInputStream(...)
new java.io.FileOutputStream(...)
new java.io.File(...)
java.nio.file.Paths.get(...)
java.io.File.createTempFile(...)
java.io.File.createTempDirectory(...)
java.nio.file.Files.createTempFile(...)
java.nio.file.Files.createTempDirectory(...)
$SRC.$METHOD(...)
getClass()
getClass().getClassLoader()
(ClassLoader $C)
(Class $C)
$CLZ.getClassLoader()
getResourceAsStream
getResource
$PATH
```

Good:

```java
org.apache.commons.io.FilenameUtils.getName(...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.PT_ABSOLUTE_PATH_TRAVERSAL-1` (metavariables start with `$`):

- `(javax.servlet.http.HttpServletRequest $R).$METHOD(...)`
- `(java.util.Scanner $S).$METHOD(...)`
- `(java.util.stream.Stream).$METHOD(...)`
- `(java.util.StringJoiner $SJ).toString(...)`
- `(java.sql.ResultSet.getString $R).$METHOD(...)`
- `(java.lang.System $S).getProperty(...)`
- `(java.lang.System $S).getenv(...)`
- `(java.lang.StringBuilder $SB).toString(...)`
- `(java.io.FileInputStream $F).read(...)`
- `(java.io.FileReader $F).read(...)`
- `(java.net.Socket $S).getInputStream(...)`
- `(java.net.Socket $S).getOutputStream(...)`
- `(java.net.DatagramSocket $S).receive(...)`
- `(java.net.DatagramSocket $S).getInputStream(...)`
- `java.nio.file.Files.readAllBytes(...)`
- `java.nio.file.Files.readAllLines(...)`
- `java.nio.file.Files.lines(...)`
- `java.nio.file.Files.newBufferedReader(...)`
- `org.apache.commons.io.IOUtils.toString(...)`
- `org.apache.commons.io.IOUtils.readLines(...)`
- `org.apache.commons.io.IOUtils.toByteArray(...)`
- `(com.fasterxml.jackson.databind.ObjectMapper $OM).readValue(...)`
- `(com.fasterxml.jackson.databind.ObjectMapper $OM).treeToValue(...)`
- `$CLASS.$METHOD(..., (javax.servlet.http.HttpServletRequest $R), ...)`
- `$FUNC(..., (javax.servlet.http.HttpServletRequest $R), ...)`
- `$FUNC(..., @RequestParam String $X, ...) { ... }`
- `$LIST.add($X)`
- `$MAP.put(..., $X)`
- `$STR.concat($X)`
- `$STR = String.format(..., $X, ...)`
- `$STR = String.join(..., $X, ...)`
- `org.apache.commons.io.FilenameUtils.getName(...)`
- `$U = new java.net.URI($VAR)`
- `new java.io.File($U)`
- `java.nio.file.Paths.get($U)`
- `$VAR`
- `new java.io.RandomAccessFile($INPUT,...)`
- `$INPUT`
- `new java.io.FileReader(...)`
- `new javax.activation.FileDataSource(...)`
- `new java.io.FileInputStream(...)`
- `new java.io.FileOutputStream(...)`
- `new java.io.File(...)`
- `java.nio.file.Paths.get(...)`
- `java.io.File.createTempFile(...)`
- `java.io.File.createTempDirectory(...)`
- `java.nio.file.Files.createTempFile(...)`
- `java.nio.file.Files.createTempDirectory(...)`
- `$SRC.$METHOD(...)`
- `getClass()`
- `getClass().getClassLoader()`
- `(ClassLoader $C)`
- `(Class $C)`
- `$CLZ.getClassLoader()`
- `getResourceAsStream`
- `getResource`
- `new java.io.FileWriter($PATH, ...)`
- `$PATH`
- `new java.io.FileOutputStream($PATH, ...)`
