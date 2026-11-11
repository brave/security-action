---
name: client/dangling-pointer-trait
rubric: safety
severity: should_fix
languages: [generic]
cwe: [CWE-416]
---

**Rule.** Detected use of a trait that disables dangling pointer checks. This requires security team approval.

**Why.** Reported as CWE-416: Use After Free. See https://chromium.googlesource.com/chromium/src.git/+/main/docs/dangling_ptr.md. Ported from opengrep rule `dangling-pointer-trait` (client/dangling-pointer-trait.yaml).

## Examples

Bad:

```text
DanglingUntriaged
DisableDanglingPtrDetection
FlakyDanglingUntriaged
AcrossTasksDanglingUntriaged
AllowPtrArithmetic
AllowUninitialized
LeakedDanglingUntriaged
VectorExperimental
SetExperimental
CtnExperimental
```

## Detection hints

Literal patterns from opengrep rule `dangling-pointer-trait` (metavariables start with `$`):

- `raw_ptr<...>`
- `raw_ref<...>`
- `DanglingUntriaged`
- `DisableDanglingPtrDetection`
- `FlakyDanglingUntriaged`
- `AcrossTasksDanglingUntriaged`
- `AllowPtrArithmetic`
- `AllowUninitialized`
- `LeakedDanglingUntriaged`
- `VectorExperimental`
- `SetExperimental`
- `CtnExperimental`
