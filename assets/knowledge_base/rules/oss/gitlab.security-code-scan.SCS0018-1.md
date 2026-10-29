---
name: oss/gitlab.security-code-scan.SCS0018-1
rubric: safety
severity: should_fix
languages: [csharp]
---

**Rule.** The application dynamically constructs file or path information. If the path information comes from user input, it could be abused to read sensitive files, access other users data, or aid in exploitation to gain further system access. User input should never be used in constructing paths or files for interacting with the filesystem. This includes filenames supplied by user uploads or downloads. If possible consider hashing user input or replacing it with unique values and use `System.IO.Path.GetFullPath` to resolve and validate the path information prior to processing any file functionality. Example using `Path.GetFullPath` and not allowing direct user input: ``` // store user input alongside an ID we control struct userData { public string userFilename; public Guid id; } class Program { public static void Main() { userData data = new userData(); // user input, saved only as a reference data.userFilename = "..\\test.txt"; // random id as the filename data.id = Guid.NewGuid(); // restrict all file processing to this directory only string basePath = "C:\\Restricted\\"; // resolve the full path, but only use our random generated id string fullPath = Path.GetFullPath(basePath + data.id); // verify the path is contained within our basePath if (!fullPath.StartsWith(basePath)) { Console.WriteLine("Invalid path specified!"); return; } // process / work with file } } ``` For more information on path traversal issues see OWASP: https://owasp.org/www-community/attacks/Path_Traversal

**Why.** Reported as CWE-22. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.security_code_scan.SCS0018-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// untrusted input (source)
$PARAM
// flows to sink without sanitization
System.IO.Directory.Delete(...)
System.IO.Directory.GetFiles(...)
System.IO.Directory.Move(...)
System.IO.File.AppendAllLines(...)
System.IO.File.AppendAllLinesAsync(...)
System.IO.File.AppendAllText(...)
System.IO.File.AppendAllTextAsync(...)
System.IO.File.AppendText(...)
System.IO.File.Copy(...)
System.IO.File.Create(...)
System.IO.File.CreateText(...)
System.IO.File.Delete(...)
System.IO.File.Move(...)
System.IO.File.Open(...)
System.IO.File.OpenRead(...)
System.IO.File.OpenText(...)
System.IO.File.OpenWrite(...)
System.IO.File.ReadAllBytes(...)
System.IO.File.ReadAllBytesAsync(...)
System.IO.File.ReadAllLines(...)
System.IO.File.ReadAllLinesAsync(...)
System.IO.File.ReadAllText(...)
System.IO.File.ReadAllTextAsync(...)
System.IO.File.ReadLines(...)
System.IO.File.Replace(...)
System.IO.File.SetAccessControl(...)
System.IO.File.WriteAllBytes(...)
System.IO.File.WriteAllBytesAsync(...)
System.IO.File.WriteAllLines(...)
System.IO.File.WriteAllLinesAsync(...)
System.IO.File.WriteAllText(...)
System.IO.File.WriteAllTextAsync(...)
new System.IO.FileInfo(...)
(System.IO.FileInfo $E).CopyTo(...)
(System.IO.FileInfo $E).MoveTo(...)
(System.IO.FileInfo $E).Replace(...)
System.Reflection.Assembly.LoadFile(...)
System.Reflection.Assembly.LoadFrom(...)
System.Reflection.Assembly.ReflectionOnlyLoadFrom(...)
System.Reflection.Assembly.UnsafeLoadFrom(...)
System.AppDomain.AppendPrivatePath(...)
System.Xml.XmlReader.Create(...)
new System.IO.StreamReader.ctor(...)
new System.IO.StreamWriter.ctor(...)
new System.IO.FileStream.ctor(...)
new System.Web.Mvc.FilePathResult(...)
new Microsoft.AspNetCore.Mvc.PhysicalFileResult(...)
(Microsoft.AspNetCore.Mvc.RazorPages.PageModel $E).PhysicalFile(...)
(System.Web.UI.WebControls.FileUpload $E).SaveAs(...)
(System.Web.HttpResponse $E).TransmitFile(...)
(System.Web.HttpResponse $E).WriteFile(...)
(System.Web.HttpResponseBase $E).TransmitFile(...)
(System.Web.HttpResponseBase $E).WriteFile(...)
(System.IO.Compression.ZipFileExtensions $E).CreateEntryFromFile(...)
(System.IO.Compression.ZipFileExtensions $E).ExtractToFile(...)
(System.IO.Compression.ZipFileExtensions $E).ExtractToDirectory(...)
(System.Net.WebClient $E).DownloadFile(...)
(System.Net.WebClient $E).DownloadFileAsync(...)
(System.Net.WebClient $E).DownloadFileTaskAsync(...)
```

Good:

```text
(Microsoft.Extensions.FileProviders.PhysicalFileProvider $E).GetFileInfo(...)
(System.Web.HttpServerUtility $E).MapPath(...)
(System.Web.HttpServerUtilityBase $E).MapPath(...)
(System.Web.HttpRequest $E).MapPath(...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.security_code_scan.SCS0018-1` (metavariables start with `$`):

- `public class $CLASS : Controller {
  ...
}`
- `$PARAM`
- `^(Http)`
- `[$HTTP_ANNO]
public string $METHOD(...,$PARAM,...){...}`
- `public IActionResult $METHOD(...,$PARAM,...){...}`
- `(Microsoft.Extensions.FileProviders.PhysicalFileProvider $E).GetFileInfo(...)`
- `(System.Web.HttpServerUtility $E).MapPath(...)`
- `(System.Web.HttpServerUtilityBase $E).MapPath(...)`
- `(System.Web.HttpRequest $E).MapPath(...)`
- `System.IO.Directory.Delete(...)`
- `System.IO.Directory.GetFiles(...)`
- `System.IO.Directory.Move(...)`
- `System.IO.File.AppendAllLines(...)`
- `System.IO.File.AppendAllLinesAsync(...)`
- `System.IO.File.AppendAllText(...)`
- `System.IO.File.AppendAllTextAsync(...)`
- `System.IO.File.AppendText(...)`
- `System.IO.File.Copy(...)`
- `System.IO.File.Create(...)`
- `System.IO.File.CreateText(...)`
- `System.IO.File.Delete(...)`
- `System.IO.File.Move(...)`
- `System.IO.File.Open(...)`
- `System.IO.File.OpenRead(...)`
- `System.IO.File.OpenText(...)`
- `System.IO.File.OpenWrite(...)`
- `System.IO.File.ReadAllBytes(...)`
- `System.IO.File.ReadAllBytesAsync(...)`
- `System.IO.File.ReadAllLines(...)`
- `System.IO.File.ReadAllLinesAsync(...)`
- `System.IO.File.ReadAllText(...)`
- `System.IO.File.ReadAllTextAsync(...)`
- `System.IO.File.ReadLines(...)`
- `System.IO.File.Replace(...)`
- `System.IO.File.SetAccessControl(...)`
- `System.IO.File.WriteAllBytes(...)`
- `System.IO.File.WriteAllBytesAsync(...)`
- `System.IO.File.WriteAllLines(...)`
- `System.IO.File.WriteAllLinesAsync(...)`
- `System.IO.File.WriteAllText(...)`
- `System.IO.File.WriteAllTextAsync(...)`
- `new System.IO.FileInfo(...)`
- `(System.IO.FileInfo $E).CopyTo(...)`
- `(System.IO.FileInfo $E).MoveTo(...)`
- `(System.IO.FileInfo $E).Replace(...)`
- `System.Reflection.Assembly.LoadFile(...)`
- `System.Reflection.Assembly.LoadFrom(...)`
- `System.Reflection.Assembly.ReflectionOnlyLoadFrom(...)`
- `System.Reflection.Assembly.UnsafeLoadFrom(...)`
- `System.AppDomain.AppendPrivatePath(...)`
- `System.Xml.XmlReader.Create(...)`
- `new System.IO.StreamReader.ctor(...)`
- `new System.IO.StreamWriter.ctor(...)`
- `new System.IO.FileStream.ctor(...)`
- `new System.Web.Mvc.FilePathResult(...)`
- `new Microsoft.AspNetCore.Mvc.PhysicalFileResult(...)`
- `(Microsoft.AspNetCore.Mvc.RazorPages.PageModel $E).PhysicalFile(...)`
- `(System.Web.UI.WebControls.FileUpload $E).SaveAs(...)`
- `(System.Web.HttpResponse $E).TransmitFile(...)`
- `(System.Web.HttpResponse $E).WriteFile(...)`
- `(System.Web.HttpResponseBase $E).TransmitFile(...)`
- `(System.Web.HttpResponseBase $E).WriteFile(...)`
- `(System.IO.Compression.ZipFileExtensions $E).CreateEntryFromFile(...)`
- `(System.IO.Compression.ZipFileExtensions $E).ExtractToFile(...)`
- `(System.IO.Compression.ZipFileExtensions $E).ExtractToDirectory(...)`
- `(System.Net.WebClient $E).DownloadFile(...)`
- `(System.Net.WebClient $E).DownloadFileAsync(...)`
- `(System.Net.WebClient $E).DownloadFileTaskAsync(...)`
