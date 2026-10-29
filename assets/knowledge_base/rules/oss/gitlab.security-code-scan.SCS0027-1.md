---
name: oss/gitlab.security-code-scan.SCS0027-1
rubric: safety
severity: should_fix
languages: [csharp]
---

**Rule.** The application may allow open redirects if created using user supplied input. Open redirects are commonly abused in phishing attacks where the original domain or URL looks like a legitimate link, but then redirects a user to a malicious site. An example would be `https://example.com/redirect?url=https://%62%61%64%2e%63%6f%6d%2f%66%61%6b%65%6c%6f%67%69%6e` which, when decoded, turns into `bad.com/fakelogin`. Never redirect a client based on user input. It is recommended that the list of target links to redirect a user to are contained server side, and retrieved using a numerical value as an index to return the link to be redirected to. For example, `/redirect?id=1` would cause the application to look up the `1` index and return a URL such as `https://example.com`. This URL would then be used to redirect the user, using the 301 response code and `Location` header. For more information on open redirects see OWASP's guide: https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html

**Why.** Reported as CWE-601. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.security_code_scan.SCS0027-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// untrusted input (source)
$SRC
// flows to sink without sanitization
Redirect(...)
RedirectPermanent(...)
RedirectToRoute(...)
RedirectToRoutePermanent(...)
new RedirectResult(...)
```

Good:

```text
TryCreate(...)
Action(...)
HttpRouteUrl(...)
RouteUrl(...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.security_code_scan.SCS0027-1` (metavariables start with `$`):

- `$SRC`
- `public $RET $FUNC(...,$SRC,...){...}`
- `TryCreate(...)`
- `Action(...)`
- `HttpRouteUrl(...)`
- `RouteUrl(...)`
- `if (IsLocalUrl(...)) {
    ...
    Redirect(...);
    ...
}`
- `if ($URL.IsLocalUrl(...)) {
    ...
    Redirect(...);
    ...
}`
- `Redirect(...)`
- `RedirectPermanent(...)`
- `RedirectToRoute(...)`
- `RedirectToRoutePermanent(...)`
- `new RedirectResult(...)`
