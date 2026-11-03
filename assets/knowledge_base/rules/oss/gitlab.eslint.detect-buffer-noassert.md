---
name: oss/gitlab.eslint.detect-buffer-noassert
rubric: safety
severity: should_fix
languages: [javascript, typescript]
cwe: [CWE-119]
---

**Rule.** The application was found using `noAssert` when calling the Buffer API. The `noAssert` argument has been deprecated since Node 10. Calling the Buffer API with this argument allows the offset specified to be beyond the end of the buffer. This could result in writing or reading beyond the end of the buffer and cause a segmentation fault, leading to the application crashing. To remediate this issue, remove the `true` argument when calling any of the Buffer read or write methods. The application should still handle `RangeError` exception cases where the offset is beyond the end of the buffer. Example reading from a Buffer without the `noAssert` argument and gracefully handling errors: ``` // Create a new buffer const buf = Buffer.from([1, 2, 3, 4]); try { // Read a single byte from it, starting at offset 1 const b = buf.readInt8(1); // Work with b } catch (e) { if (e instanceof RangeError) { console.log('Invalid offset: %s', e.message); } // handle other errors } ```

**Why.** Reported as CWE-119. Ported from opengrep rule `gitlab.eslint.detect-buffer-noassert` (generated/oss/security_noaudit_novuln.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.eslint.detect-buffer-noassert` (metavariables start with `$`):

- `$OBJ.readUInt8(..., true)`
- `$OBJ.readUInt16LE(..., true)`
- `$OBJ.readUInt16BE(..., true)`
- `$OBJ.readUInt32LE(..., true)`
- `$OBJ.readUInt32BE(..., true)`
- `$OBJ.readInt8(..., true)`
- `$OBJ.readInt16LE(..., true)`
- `$OBJ.readInt16BE(..., true)`
- `$OBJ.readInt32LE(..., true)`
- `$OBJ.readInt32BE(..., true)`
- `$OBJ.readFloatLE(..., true)`
- `$OBJ.readFloatBE(..., true)`
- `$OBJ.readDoubleLE(..., true)`
- `$OBJ.readDoubleBE(..., true)`
- `$OBJ.writeUInt8(..., true)`
- `$OBJ.writeUInt16LE(..., true)`
- `$OBJ.writeUInt16BE(..., true)`
- `$OBJ.writeUInt32LE(..., true)`
- `$OBJ.writeUInt32BE(..., true)`
- `$OBJ.writeInt8(..., true)`
- `$OBJ.writeInt16LE(..., true)`
- `$OBJ.writeInt16BE(..., true)`
- `$OBJ.writeInt32LE(..., true)`
- `$OBJ.writeInt32BE(..., true)`
- `$OBJ.writeFloatLE(..., true)`
- `$OBJ.writeFloatBE(..., true)`
- `$OBJ.writeDoubleLE(..., true)`
- `$OBJ.writeDoubleBE(..., true)`
