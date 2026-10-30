---
name: client/raptor-interesting-api-calls
rubric: safety
severity: nit
languages: [c, cpp]
---

**Rule.** Locate all calls to interesting and potentially insecure API functions (candidate points). The auditor can backtrace from these candidate points to find pathways allowing access from untrusted input.

**Why.** See https://github.com/0xdea/ghidra-scripts/blob/main/Rhabdomancer.java. See https://github.com/x509cert/banned/blob/master/banned.h. See https://g.co/kgs/PCHQjJ. See https://www.sei.cmu.edu/downloads/sei-cert-c-coding-standard-2016-v01.pdf. Ported from opengrep rule `raptor-interesting-api-calls` (client/interesting-api-calls.yaml).

## Examples

Bad:

```cpp
$FUNC(...)
```

Good:

```cpp
RunOnUIThread
CalledOnValidThread
```

## Detection hints

Literal patterns from opengrep rule `raptor-interesting-api-calls` (metavariables start with `$`):

- `$FUNC(...)`
- `\w*(set\w*(u|g)id|(init|set)groups|str\w?cpy|stpn?cpy|str\w?cat|wcs\w?cpy|wcpn?cpy|wcs\w?cat|strtok|wcstok|s\w?printf\w*\(.*|sn\w?printf\w*\(.*|scanf|get(s|c|char|pw|pass|wd|cwd|env|opt|opt_long)|memc?cpy|mem(move|set)|bcopy|alloca|exec(l|v)?(p|e)?e?|system|open(at)?(64)?|pipe|connect|read|recv(from)?|fork|clone|mk\w?temp(64)?|te?mpnam|tmpfile|mkdir|creat|link(at)?|rename(at)?|access(at)?|stat(at)?|ch(own|mod)(at)?|assert)$`
- `RunOnUIThread`
- `CalledOnValidThread`
