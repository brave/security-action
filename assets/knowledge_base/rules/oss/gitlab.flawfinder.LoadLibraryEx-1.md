---
name: oss/gitlab.flawfinder.LoadLibraryEx-1
rubric: safety
severity: should_fix
languages: [c, cpp]
cwe: [CWE-20]
---

**Rule.** The `LoadLibraryEx` function is used to load DLLs dynamically. Depending on the filepath parameter, the OS version, and the modes set for the process prior to calling LoadLibrary, DLL hijacking may be possible. Attackers can exploit this by placing DLL files with the same name in directories that are searched before the legitimate DLL is. To assist in preventing against this class of vulnerability consider: - Specifying a fully qualified path when using LoadLibraryEx. - Use the `LOAD_LIBRARY_SEARCH` flags with LoadLibraryEx or with SetDefaultDllDirectories. - If you use SetDefaultDllDirectories, be sure to use the AddDllDirectory or SetDllDirectory functions to modify the list of directories. - Only use `SearchPath` if the `SetSearchPathMode` function is called with `BASE_SEARCH_PATH_ENABLE_SAFE_SEARCHMODE`. (Note: this only moves the current directory to the end of the SearchPath search list.) For more information see the security remarks section of the MSDN documentation: https://learn.microsoft.com/en-us/windows/win32/api/libloaderapi/nf-libloaderapi-loadlibrarya#security-remarks For general information securely loading dynamic link libraries, see the MSDN documentation: https://learn.microsoft.com/en-us/windows/win32/dlls/dynamic-link-library-security

**Why.** Reported as CWE-20. Ported from opengrep rule `gitlab.flawfinder.LoadLibraryEx-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.LoadLibraryEx-1` (metavariables start with `$`):

- `LoadLibraryEx(...)`
