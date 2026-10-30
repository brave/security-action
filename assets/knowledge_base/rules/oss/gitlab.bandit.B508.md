---
name: oss/gitlab.bandit.B508
rubric: safety
severity: should_fix
languages: [python]
cwe: [CWE-319]
---

**Rule.** Pysnmp was detected using versions SNMPv1 or SNMPv2. SNPMv1 and SNMPv2 are insecure and should no longer be used as they do not offer encryption. If possible, query SNMP devices using SNMPv3 instead. Example querying a device using SNMPv3 with SHA-AES: ``` from pysnmp.hlapi import * # Create the snpm iterator iterator = getCmd( SnmpEngine(), # Configure using SHA AES UsmUserData('usr-sha-aes', 'authkey1', 'privkey1', authProtocol=USM_AUTH_HMAC96_SHA, privProtocol=USM_PRIV_CFB128_AES), UdpTransportTarget(('demo.snmplabs.com', 161)), ContextData(), ObjectType(ObjectIdentity('SNMPv2-MIB', 'sysDescr', 0)) ) ``` For more information on using SNMPv3 with `Pysnmp` see: - https://pysnmp.readthedocs.io/en/latest/examples/hlapi/v3arch/asyncore/sync/manager/cmdgen/snmp-versions.html#snmpv3-auth-sha-privacy-aes128

**Why.** Reported as CWE-319. Ported from opengrep rule `gitlab.bandit.B508` (generated/oss/audit.yaml).

## Examples

Bad:

```python
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B508` (metavariables start with `$`):

- `pysnmp.hlapi.CommunityData(..., mpModel=0, ...)`
- `pysnmp.hlapi.CommunityData(..., mpModel=1, ...)`
