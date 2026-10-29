---
name: oss/gitlab.security-code-scan.SCS0028-1
rubric: safety
severity: should_fix
languages: [csharp]
---

**Rule.** Deserialization attacks exploit the process of reading serialized data and turning it back into an object. By constructing malicious objects and serializing them, an adversary may attempt to: - Inject code that is executed upon object construction, which occurs during the deserialization process. - Exploit mass assignment by including fields that are not normally a part of the serialized data but are read in during deserialization. Microsoft recommends no longer using the following serialization formats: - BinaryFormatter - SoapFormatter - NetDataContractSerializer - LosFormatter - ObjectStateFormatter Consider safer alternatives such as serializing data in the JSON format. Ensure any format chosen allows the application to specify exactly which object types are allowed to be deserialized. Additionally, when deserializing, never deserialize to base object types like `Object` and only cast to the exact object type that is expected. To protect against mass assignment, only allow deserialization of the specific fields that are required. If this is not easily done, consider creating an intermediary type that can be serialized with only the necessary fields exposed. For more information see Microsoft's deserialization security guide: https://learn.microsoft.com/en-us/dotnet/standard/serialization/binaryformatter-security-guide For more details on deserialization attacks in general, see OWASP's guide: https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html It should be noted that [tools exist](https://github.com/pwntester/ysoserial.net) to automatically create exploit code for these vulnerabilities.

**Why.** Reported as CWE-502. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.security_code_scan.SCS0028-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// untrusted input (source)
Request.Cookies[...]
Request.Cookies.Get(...)
Request.Form[...]
Request.Form.Get(...)
Request.Headers[...]
Request.Headers.Get(...)
Request.QueryString[...]
Request.QueryString.Get(...)
Request.Body
$CTX.Request.Cookies[...]
$CTX.Request.Cookies.Get(...)
$CTX.Request.Form[...]
$CTX.Request.Form.Get(...)
$CTX.Request.Headers[...]
$CTX.Request.Headers.Get(...)
$CTX.Request.QueryString[...]
$CTX.Request.QueryString.Get(...)
$CTX.Request.Body
System.IO.File.ReadAllText(...)
System.IO.File.ReadAllTextAsync(...)
System.IO.File.ReadAllLines(...)
System.IO.File.ReadAllLinesAsync(...)
System.IO.File.ReadAllBytes(...)
System.IO.File.ReadAllBytesAsync(...)
System.IO.File.ReadLines(...)
System.IO.File.ReadLinesAsync(...)
System.Environment.GetEnvironmentVariable(...)
// flows to sink without sanitization
(System.Runtime.Serialization.Formatters.Binary.BinaryFormatter $OBJ).Deserialize(...)
(System.Runtime.Serialization.Formatters.Binary.BinaryFormatter $OBJ).UnsafeDeserialize(...)
(System.Runtime.Serialization.Formatters.Binary.BinaryFormatter $OBJ).UnsafeDeserializeMethod(...)
(System.Runtime.Serialization.Formatters.Soap.SoapFormatter $OBJ).Deserialize(...)
(System.Runtime.Serialization.NetDataContractSerializer $OBJ).Deserialize(...)
(System.Web.UI.LosFormatter $OBJ).Deserialize(...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.security_code_scan.SCS0028-1` (metavariables start with `$`):

- `Request.Cookies[...]`
- `Request.Cookies.Get(...)`
- `Request.Form[...]`
- `Request.Form.Get(...)`
- `Request.Headers[...]`
- `Request.Headers.Get(...)`
- `Request.QueryString[...]`
- `Request.QueryString.Get(...)`
- `Request.Body`
- `$CTX.Request.Cookies[...]`
- `$CTX.Request.Cookies.Get(...)`
- `$CTX.Request.Form[...]`
- `$CTX.Request.Form.Get(...)`
- `$CTX.Request.Headers[...]`
- `$CTX.Request.Headers.Get(...)`
- `$CTX.Request.QueryString[...]`
- `$CTX.Request.QueryString.Get(...)`
- `$CTX.Request.Body`
- `System.IO.File.ReadAllText(...)`
- `System.IO.File.ReadAllTextAsync(...)`
- `System.IO.File.ReadAllLines(...)`
- `System.IO.File.ReadAllLinesAsync(...)`
- `System.IO.File.ReadAllBytes(...)`
- `System.IO.File.ReadAllBytesAsync(...)`
- `System.IO.File.ReadLines(...)`
- `System.IO.File.ReadLinesAsync(...)`
- `System.Environment.GetEnvironmentVariable(...)`
- `(System.Runtime.Serialization.Formatters.Binary.BinaryFormatter $OBJ).Deserialize(...)`
- `(System.Runtime.Serialization.Formatters.Binary.BinaryFormatter $OBJ).UnsafeDeserialize(...)`
- `(System.Runtime.Serialization.Formatters.Binary.BinaryFormatter $OBJ).UnsafeDeserializeMethod(...)`
- `(System.Runtime.Serialization.Formatters.Soap.SoapFormatter $OBJ).Deserialize(...)`
- `(System.Runtime.Serialization.NetDataContractSerializer $OBJ).Deserialize(...)`
- `(System.Web.UI.LosFormatter $OBJ).Deserialize(...)`
