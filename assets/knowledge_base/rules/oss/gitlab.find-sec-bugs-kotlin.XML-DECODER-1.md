---
name: oss/gitlab.find-sec-bugs-kotlin.XML-DECODER-1
rubric: safety
severity: should_fix
languages: [kotlin]
---

**Rule.** Avoid using XMLDecoder to parse content from an untrusted source.

**Why.** Reported as CWE-502. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.XML_DECODER-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
($D: java.beans.XMLDecoder).readObject()
$D.readObject()
```

Good:

```text
$DEC = java.beans.XMLDecoder(..., $CL)
...
$DEC.readObject()
object : ClassLoader() {
  ...
  fun loadClass(name: String, resolve: Boolean): $RET {
    if($X){
      throw ...
    }
    ...
  }
  ...
}
name != ...
!$LIST.contains(name)
$CLASS_LOADER  = $CL
...
$DEC = java.beans.XMLDecoder(..., $CLASS_LOADER)
...
object : ClassLoader(){
  ...
  fun loadClass(name: String, resolve: Boolean): $RET{
    if($X){
      throw ...
    }
    ...
  }
  ...
}
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.XML_DECODER-1` (metavariables start with `$`):

- `($D: java.beans.XMLDecoder).readObject()`
- `$D.readObject()`
- `$D = XMLDecoder(...)
...`
- `$DEC = java.beans.XMLDecoder(..., $CL)
...`
- `$DEC.readObject()`
- `object : ClassLoader() {
  ...
  fun loadClass(name: String, resolve: Boolean): $RET {
    if($X){
      throw ...
    }
    ...
  }
  ...
}`
- `name != ...`
- `!$LIST.contains(name)`
- `$CLASS_LOADER  = $CL
...`
- `$DEC = java.beans.XMLDecoder(..., $CLASS_LOADER)
...`
- `object : ClassLoader(){
  ...
  fun loadClass(name: String, resolve: Boolean): $RET{
    if($X){
      throw ...
    }
    ...
  }
  ...
}`
