---
name: oss/gitlab.find-sec-bugs.XML-DECODER-1
rubric: safety
severity: should_fix
languages: [java]
cwe: [CWE-502]
---

**Rule.** Deserialization attacks exploit the process of reading serialized data and turning it back into an object. By constructing malicious objects and serializing them, an adversary may attempt to: - Inject code that is executed upon object construction, which occurs during the deserialization process. - Exploit mass assignment by including fields that are not normally a part of the serialized data but are read in during deserialization. Consider safer alternatives such as serializing data in the JSON format. Ensure any format chosen allows the application to specify exactly which object types are allowed to be deserialized. Additionally, when deserializing, never deserialize to base object types like `Object` and only cast to the exact object type that is expected. To protect against mass assignment, only allow deserialization of the specific fields that are required. If this is not easily done, consider creating an intermediary type that can be serialized with only the necessary fields exposed. Do note that `XMLEncoder` and `XMLDecoder` are not recommended. If the application must use this serialization method, use a custom ClassLoader to prevent loading of arbitrary classes: ``` XMLDecoder decoder = new XMLDecoder(inputStream, null, null, new ClassLoader() { @Override protected Class<?> loadClass(String name, boolean resolve) throws ClassNotFoundException { if (!name.equals(NameOfBeanHere.class.getName()) && !name.equals(XMLDecoder.class.getName())) { throw new RuntimeException("Unauthorized deserialization attempt: " + name); } return super.loadClass(name, resolve); } }); ``` For more information on XML security see OWASP's guide: https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html#java For more details on deserialization attacks in general, see OWASP's guide: https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html It should be noted that [tools exist](https://github.com/frohoff/ysoserial) to automatically create exploit code for these vulnerabilities.

**Why.** Reported as CWE-502. Ported from opengrep rule `gitlab.find_sec_bugs.XML_DECODER-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
(java.beans.XMLDecoder $D).readObject();
```

Good:

```java
java.beans.XMLDecoder $DEC = new java.beans.XMLDecoder(..., $CL);
...
$DEC.readObject();
new ClassLoader(){
  ...
  $RET loadClass(String name, boolean resolve){
    if($X){
      throw ...
    }
    ...
  }
  ...
}
!name.equals(...)
!$LIST.contains(name)
ClassLoader $CLASS_LOADER = $CL;
...
java.beans.XMLDecoder $DEC = new java.beans.XMLDecoder(..., $CLASS_LOADER);
...
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.XML_DECODER-1` (metavariables start with `$`):

- `(java.beans.XMLDecoder $D).readObject();`
- `java.beans.XMLDecoder $DEC = new java.beans.XMLDecoder(..., $CL);
...`
- `$DEC.readObject();`
- `new ClassLoader(){
  ...
  $RET loadClass(String name, boolean resolve){
    if($X){
      throw ...
    }
    ...
  }
  ...
}`
- `!name.equals(...)`
- `!$LIST.contains(name)`
- `ClassLoader $CLASS_LOADER = $CL;
...
java.beans.XMLDecoder $DEC = new java.beans.XMLDecoder(..., $CLASS_LOADER);
...`
