---
name: oss/mobsf.mobsfscan.best-practices.android-safetynetapi.android-safetynet-api
rubric: correctness
severity: nit
languages: [java]
---

**Rule.** This app does not uses SafetyNet Attestation API that provides cryptographically-signed attestation, assessing the device's integrity. This check helps to ensure that the servers are interacting with the genuine app running on a genuine Android device.

**Why.** Reported as cwe-353. Ported from opengrep rule `mobsf.mobsfscan.best_practices.android_safetynetapi.android_safetynet_api` (generated/oss/others.yaml).

## Examples

Bad:

```java
import com.google.android.gms.safetynet.SafetyNetApi;
$S = SafetyNet.getClient(...);
...
$T = $S.attest(...);
new RNGoogleSafetyNetPackage(...)
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.best_practices.android_safetynetapi.android_safetynet_api` (metavariables start with `$`):

- `import com.google.android.gms.safetynet.SafetyNetApi;`
- `$S = SafetyNet.getClient(...);
...
$T = $S.attest(...);`
- `new RNGoogleSafetyNetPackage(...)`
