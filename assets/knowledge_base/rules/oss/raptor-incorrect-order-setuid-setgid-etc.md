---
name: oss/raptor-incorrect-order-setuid-setgid-etc
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** A compromised process might be able to regain elevated group privileges if set(e)gid() is called after set(e)uid(). A similar case is when privileges are temporarily dropped with seteuid() and then setuid() or seteuid() are called from while under unprivileged user.

**Why.** See https://cwe.mitre.org/data/definitions/696. See https://www.usenix.org/legacy/events/sec02/full_papers/chen/chen.pdf. See https://g.co/kgs/PCHQjJ. See https://github.com/struct/mms. Ported from opengrep rule `raptor-incorrect-order-setuid-setgid-etc` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `raptor-incorrect-order-setuid-setgid-etc` (metavariables start with `$`):

- `setuid(...);
...
setgid(...);`
- `setuid(0);
...
setgid(...);`
- `seteuid(...);
...
setegid(...);`
- `seteuid(0);
...
setegid(...);`
- `seteuid(...);
...
seteuid(0);
...
setegid(...);`
- `seteuid(...);
...
setuid(...);`
- `seteuid(0);
...
setuid(...);`
- `seteuid(...);
...
seteuid(0);
...
setuid(...);`
- `seteuid(...);
...
seteuid(...);`
- `seteuid(0);
...
seteuid(...);`
- `seteuid(...);
...
seteuid(0);`
- `seteuid(...);
...
seteuid(0);
...
seteuid(...);`
