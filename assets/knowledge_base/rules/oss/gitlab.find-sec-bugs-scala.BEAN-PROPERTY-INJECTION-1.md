---
name: oss/gitlab.find-sec-bugs-scala.BEAN-PROPERTY-INJECTION-1
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-15]
---

**Rule.** An attacker can set arbitrary bean properties that can compromise system integrity. An attacker can leverage this functionality to access special bean properties like class.classLoader that will allow them to override system properties and potentially execute arbitrary code.

**Why.** Reported as CWE-15. Ported from opengrep rule `gitlab.find_sec_bugs_scala.BEAN_PROPERTY_INJECTION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
$MAP.put(..., $REQ.getParameter(...))
...
$BEAN_UTIL.populate(..., $MAP)
while (...) {
    ...
    $MAP.put(..., $REQ.getParameterValues(...). ...)
}
...
$BEAN_UTIL.populate(..., $MAP)
(BeanUtilsBean $B)
new BeanUtilsBean()
org.apache.commons.beanutils.BeanUtils
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.BEAN_PROPERTY_INJECTION-1` (metavariables start with `$`):

- `def $FUNC(..., $REQ: HttpServletRequest, ...): $TYPE = { ... }`
- `$MAP.put(..., $REQ.getParameter(...))
...
$BEAN_UTIL.populate(..., $MAP)`
- `while (...) {
    ...
    $MAP.put(..., $REQ.getParameterValues(...). ...)
}
...
$BEAN_UTIL.populate(..., $MAP)`
- `(BeanUtilsBean $B)`
- `new BeanUtilsBean()`
- `org.apache.commons.beanutils.BeanUtils`
