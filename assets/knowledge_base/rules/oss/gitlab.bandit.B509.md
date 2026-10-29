---
name: oss/gitlab.bandit.B509
rubric: safety
severity: should_fix
languages: [python]
---

**Rule.** Pysnmp was detected using SNMPv3 without authentication or encryption protections enabled. - Use of `usmNoAuthProtocol` or `usmNoPrivProtocol` indicates that either authentication or privacy, respectively, is not being used. - The absence of `authKey` (or `authKey=None`) implies no authentication, which is equivalent to using `usmNoAuthProtocol`. - The absence of `privKey` (or `privKey=None`) implies no privacy (encryption), which is equivalent to using `usmNoPrivProtocol`. To enhance the security of your SNMP communications, it is recommended to use both authentication and privacy features in SNMPv3: - Use SHA for Authentication: SHA (Secure Hash Algorithm) is a more secure option for SNMP message authentication. To use SHA, set the `authProtocol` to `usmHMACSHAAuthProtocol` and provide a strong `authKey`. - Use AES for Privacy: AES (Advanced Encryption Standard) is recommended for encrypting SNMP messages. Set the `privProtocol` to `usmAesCfb128Protocol` or a similar AES-based protocol and specify a strong `privKey`. Example of secure `UsmUserData` configuration: ``` from pysnmp.hlapi import UsmUserData, usmHMACSHAAuthProtocol, usmAesCfb128Protocol user_data = UsmUserData('username','authKey', 'privKey', authProtocol=usmHMACSHAAuthProtocol, privProtocol=usmAesCfb128Protocol) ```

**Why.** Reported as CWE-319. Ported from opengrep rule `gitlab.bandit.B509` (generated/oss/audit.yaml).

## Examples

Bad:

```python
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B509` (metavariables start with `$`):

- `UsmUserData(.*usmNoAuthProtocol.*)`
- `UsmUserData(.*usmNoPrivProtocol.*)`
- `UsmUserData(..., authKey=None, ...)`
- `UsmUserData(..., privKey=None, ...)`
- `UsmUserData(..., authProtocol=(1,3,6,1,6,3,10,1,1,1), ...)`
- `UsmUserData(..., privProtocol=(1,3,6,1,6,3,10,1,2,1), ...)`
- `UsmUserData($NAME,$AUTHKEY,"...", ...)`
- `UsmUserData(..., privKey=$PRIVKEY, ...)`
- `UsmUserData(..., privProtocol=$PRIVPROT, ...)`
- `UsmUserData(...)`
