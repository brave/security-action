---
name: client/glide-library
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** The Glide image loading library is not yet approved, new usages should not be implemented until the security team has given their approval.

**Why.** See https://github.com/brave/reviews/issues/1391. Ported from opengrep rule `glide-library` (client/glide-library.yaml).

## Examples

Bad:

```java
import com.bumptech.glide
Glide.with(...)
```

## Detection hints

Literal patterns from opengrep rule `glide-library` (metavariables start with `$`):

- `import com.bumptech.glide`
- `Glide.with(...)`
