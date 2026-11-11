---
name: oss/gitlab.find-sec-bugs.FILE-UPLOAD-FILENAME-1
rubric: safety
severity: should_fix
languages: [java]
cwe: [CWE-22]
---

**Rule.** The filename provided by the FileUpload API can be tampered with which could lead to unauthorized access or file inclusion vulnerabilities. To mitigate this risk, it is essential to conduct rigorous validation of the filenames provided by clients. This validation should ensure that the filename adheres to a predefined structure, is devoid of potentially dangerous characters (such as forward slashes / and backslashes \), and corresponds to an authorized file only. For example, as a remediation strategy, the application could: 1. Sanitize Filenames: Create a function to sanitize filenames by removing or replacing unauthorized characters, including path traversal sequences (../ or ..\). 2. Allowlist Validation: Implement a allowlist approach, allowing only filenames that match a specific pattern or are part of a predefined list. 3. Use Server-Generated Filenames: Rather than relying on client-provided filenames, generate unique names server-side for storing files. 4. Verify File Paths: Ensure files are being saved in the correct, intended directory, and prevent redirection to unauthorized directories. Example remediation: ``` public class FileUploadHandler { protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException { Part filePart = request.getPart("file"); String fileName = filePart.getSubmittedFileName(); // removes any path information from the filename String sanitizedFileName = sanitizeFileName(fileName); if (!isFileNameAllowed(sanitizedFileName)) { throw new SecurityException("Invalid file name"); } // Generate a unique file name for storage String storedFileName = UUID.randomUUID().toString() + ".txt"; Path targetPath = Paths.get("uploads").resolve(storedFileName); Files.copy(fileContent, targetPath, StandardCopyOption.REPLACE_EXISTING); } private String sanitizeFileName(String fileName) { return Paths.get(fileName).getFileName().toString(); } private boolean isFileNameAllowed(String fileName) { return fileName.matches("[a-zA-Z0-9._-]+"); } } ```

**Why.** Reported as CWE-22. Ported from opengrep rule `gitlab.find_sec_bugs.FILE_UPLOAD_FILENAME-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.FILE_UPLOAD_FILENAME-1` (metavariables start with `$`):

- `$FILES = (ServletFileUpload $SFU).parseRequest(($X.servlet.http.HttpServletRequest $REQ));
...
for(FileItem $ITEM : $FILES) {
  ...
}`
- `$ITEM.getName()`
- `($X.servlet.http.Part $PART).getSubmittedFileName()`
