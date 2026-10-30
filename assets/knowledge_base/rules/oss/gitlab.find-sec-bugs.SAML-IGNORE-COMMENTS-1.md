---
name: oss/gitlab.find-sec-bugs.SAML-IGNORE-COMMENTS-1
rubric: safety
severity: should_fix
languages: [java]
cwe: [CWE-287]
---

**Rule.** SAML parses attestations as an XML document. By processing XML comments, comment fields can end up modifying the interpretation of input fields. This could allow an adversary to insert an XML comment to break up the attestation's username or other fields, allowing an attacker to bypass authorization or authentication checks. To remediate this issue, when using `org.opensaml.xml.parse.BasicParserPool` ensure `setIgnoreComments(false)` is not called. The default value of `ignoreComments` is true, which is safe. Ref: - https://javadoc.io/doc/org.opensaml/xmltooling/latest/org/opensaml/xml/parse/BasicParserPool.html#ignoreComments For more information on how this issue can be exploited see: https://developer.okta.com/blog/2018/02/27/a-breakdown-of-the-new-saml-authentication-bypass-vulnerability For more information on SAML security see OWASP: https://cheatsheetseries.owasp.org/cheatsheets/SAML_Security_Cheat_Sheet.html

**Why.** Reported as CWE-287. Ported from opengrep rule `gitlab.find_sec_bugs.SAML_IGNORE_COMMENTS-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.SAML_IGNORE_COMMENTS-1` (metavariables start with `$`):

- `(org.opensaml.xml.parse.BasicParserPool $POOL).setIgnoreComments(false);`
