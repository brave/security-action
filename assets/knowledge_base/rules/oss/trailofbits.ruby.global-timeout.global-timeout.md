---
name: oss/trailofbits.ruby.global-timeout.global-timeout
rubric: safety
severity: should_fix
languages: [ruby]
cwe: [CWE-460]
---

**Rule.** Found `Timeout::timeout` (or `timeout`) use. Setting a global timeout can cause an exception to be raised anywhere in the passed block of code. This precludes any possible clean up action typically associated with rescuing from exceptions. This can lead to denial-of-service, data integrity failure, and general availability concerns. Instead prefer to use the library's built in timeout functionality, if it has any, to ensure processing happens as expected. If it does not have built in timeout functionality, then consider implementing it.

**Why.** Reported as CWE-460: Improper Cleanup on Thrown Exception. See https://ruby-doc.org/3.3.2/stdlibs/timeout/Timeout.html. See https://jvns.ca/blog/2015/11/27/why-rubys-timeout-is-dangerous-and-thread-dot-raise-is-terrifying/. See https://www.mikeperham.com/2015/05/08/timeout-rubys-most-dangerous-api/. See http://blog.headius.com/2008/02/rubys-threadraise-threadkill-timeoutrb.html. Ported from opengrep rule `trailofbits.ruby.global-timeout.global-timeout` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.ruby.global-timeout.global-timeout` (metavariables start with `$`):

- `Timeout::timeout(...)`
- `Timeout.timeout(...)`
- `timeout(...)`
