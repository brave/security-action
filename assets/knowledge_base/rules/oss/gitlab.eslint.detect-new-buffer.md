---
name: oss/gitlab.eslint.detect-new-buffer
rubric: safety
severity: should_fix
languages: [javascript, typescript]
---

**Rule.** The application was found calling the `new Buffer` constructor which has been deprecated since Node 8. By passing in a non-literal value, an adversary could allocate large amounts of memory. Other issues also exist with the `Buffer` constructor: - Older versions would return uninitialized memory, which could contain sensitive information - Unable to easily determine what a Buffer contained if passed a non-literal value To remediate this issue, use `Buffer.alloc` or `Buffer.from` instead to allocate a new `Buffer`. Example using `Buffer.alloc` instead of `new Buffer(...)`: ``` // Create a new buffer using Buffer.from const buf = Buffer.from([1, 2, 3, 4]); // Work with buf ``` For more information on migrating to `Buffer.from()`/`Buffer.alloc()` see: - https://nodejs.org/en/docs/guides/buffer-constructor-deprecation

**Why.** Reported as CWE-770. Ported from opengrep rule `gitlab.eslint.detect-new-buffer` (generated/oss/security_noaudit_novuln.yaml).

## Examples

Bad:

```text
new Buffer($X,...)
```

Good:

```text
require("safe-buffer")
...
import { Buffer } from "safe-buffer"
...
new Buffer("...",...)
new Buffer([...] , ...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.eslint.detect-new-buffer` (metavariables start with `$`):

- `require("safe-buffer")
...`
- `import { Buffer } from "safe-buffer"
...`
- `function $FUNC(..., $X, ...) { ... }`
- `new Buffer($X,...)`
- `new Buffer("...",...)`
- `new Buffer([...] , ...)`
