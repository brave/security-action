---
name: oss/raptor-interesting-api-calls
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** Locate all calls to interesting and potentially insecure API functions (candidate points). The auditor can backtrace from these candidate points to find pathways allowing access from untrusted input.

**Why.** See https://github.com/0xdea/ghidra-scripts/blob/main/Rhabdomancer.java. See https://github.com/x509cert/banned/blob/master/banned.h. See https://g.co/kgs/PCHQjJ. See https://www.sei.cmu.edu/downloads/sei-cert-c-coding-standard-2016-v01.pdf. See https://learn.microsoft.com/en-us/windows-hardware/drivers/devtest/28719-banned-api-usage-use-updated-function-replacement. Ported from opengrep rule `raptor-interesting-api-calls` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `raptor-interesting-api-calls` (metavariables start with `$`):

- `$FUN(...)`
- `^\w*set\w*(u|g)id\s*$|^\w*(init|set)groups\s*$`
- `^\w*str\w?cpy\s*$|^\w*stpn?cpy\s*$|^\w*wcs\w?cpy\s*$|^\w*wcpn?cpy\s*$`
- `^\w*str\w?cat\s*$|^\w*wcs\w?cat\s*$`
- `^\w*strtok\s*$|^\w*wcstok\s*$`
- `^\w*s\w?printf\w*\s*$`
- `^\w*scanf\s*$`
- `^\w*get(s|c|char|pw|pass|wd|cwd|opt|opt_long)\s*$`
- `^\w*(get|set|put|unset)env\s*$`
- `^\w*memc?cpy(_s)?\s*$|^\w*memmove(_s)?\s*$|^\w*bcopy\s*$`
- `^\w*alloc(a|f)?\s*$|^\w*alloc_?array\s*$`
- `^\w*exec(l|v)?(p|e)?e?\s*$|^\w*system\s*$`
- `^\w*open(at)?(64)?\s*$|^\w*pipe\s*$|^\w*read\s*$|^\w*recv(from)?\s*$`
- `^\w*fork\s*$`
- `^\w*rand\s*$`
- `^\w*mk\w?temp(64)?\s*$|^\w*te?mpnam\s*$|^\w*tmpfile\s*$`
- `^\w*mkdir\s*$|^\w*creat\s*$|^\w*link(at)?\s*$|^\w*rename(at)?\s*$|^\w*access(at|_ok)?\s*$|^\w*stat(at)?\s*$|^\w*ch(own|mod)(at)?\s*$|^\w*realpath(at)?\s*$|^\w*readlink\s*$`
- `^\w*locale\s*$|^\w*(make|split)path\s*$`
- `^\w*copy_(from|to)_user\s*$|^\w*(get|put)_user\s*$|^\w*copy(in|out)\s*$`
