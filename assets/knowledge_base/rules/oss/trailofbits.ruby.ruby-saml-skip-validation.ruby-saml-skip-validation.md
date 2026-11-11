---
name: oss/trailofbits.ruby.ruby-saml-skip-validation.ruby-saml-skip-validation
rubric: safety
severity: should_fix
languages: [ruby]
cwe: [CWE-345]
---

**Rule.** SAML response validation disabled for $KEY.

**Why.** Reported as CWE-345: Insufficient Verification of Data Authenticity. See https://github.com/SAML-Toolkits/ruby-saml/blob/v1.16.0/lib/onelogin/ruby-saml/response.rb. Ported from opengrep rule `trailofbits.ruby.ruby-saml-skip-validation.ruby-saml-skip-validation` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.ruby.ruby-saml-skip-validation.ruby-saml-skip-validation` (metavariables start with `$`):

- `OneLogin::RubySaml::Response.new($RESPONSE, {..., skip_audience: true, ...})`
- `OneLogin::RubySaml::Response.new($RESPONSE, {..., skip_authnstatement: true, ...})`
- `OneLogin::RubySaml::Response.new($RESPONSE, {..., skip_conditions: true, ...})`
- `OneLogin::RubySaml::Response.new($RESPONSE, {..., skip_destination: true, ...})`
- `OneLogin::RubySaml::Response.new($RESPONSE, {..., skip_recipient_check: true, ...})`
- `OneLogin::RubySaml::Response.new($RESPONSE, {..., skip_subject_confirmation: true, ...})`
- `$SETTINGS = OneLogin::RubySaml::Settings.new(...)
...
$SETTINGS.$KEY = true`
- `$SETTINGS = OneLogin::RubySaml::Settings.new
...
$SETTINGS.$KEY = true`
- `skip_audience`
- `skip_authnstatement`
- `skip_conditions`
- `skip_destination`
- `skip_recipient_check`
- `skip_subject_confirmation`
