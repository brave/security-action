---
name: services/missing-integrity
rubric: safety
severity: should_fix
languages: [generic]
---

**Rule.** This tag is missing an 'integrity' subresource integrity attribute. The 'integrity' attribute allows for the browser to verify that externally hosted files (for example from a CDN) are delivered without unexpected manipulation. Without this attribute, if an attacker can modify the externally hosted resource, this could lead to XSS and other types of attacks. To prevent this, include the base64-encoded cryptographic hash of the resource (file) you’re telling the browser to fetch in the 'integrity' attribute for all externally hosted files.

**Why.** Reported as CWE-353: Missing Support for Integrity Check. See https://owasp.org/Top10/A08_2021-Software_and_Data_Integrity_Failures. Ported from opengrep rule `missing-integrity` (services/missing-integrity.yaml).

## Examples

Bad:

```text
<script $...A >...</script>
<link $...A >
src='... :// ...'
src="... :// ..."
href='... :// ...'
href="... :// ..."
src='//...'
src="//..."
href='//...'
href="//..."
```

Good:

```text
(?is).*integrity=
(google-analytics.com|fonts.googleapis.com|googletagmanager.com)
chrome:\/\/
chrome-untrusted:\/\/
```

## Detection hints

Literal patterns from opengrep rule `missing-integrity` (metavariables start with `$`):

- `<script $...A >...</script>`
- `<link $...A >`
- `src='... :// ...'`
- `src="... :// ..."`
- `href='... :// ...'`
- `href="... :// ..."`
- `src='//...'`
- `src="//..."`
- `href='//...'`
- `href="//..."`
- `(?is).*integrity=`
- `(google-analytics.com|fonts.googleapis.com|googletagmanager.com)`
- `chrome:\/\/`
- `chrome-untrusted:\/\/`
