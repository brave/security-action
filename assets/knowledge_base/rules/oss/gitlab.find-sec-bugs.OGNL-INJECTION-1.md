---
name: oss/gitlab.find-sec-bugs.OGNL-INJECTION-1
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** The Object Graph Navigation Language (OGNL) is an expression language that allows access to Java objects and properties stored in an ActionContext. Usage of these low-level functions is discouraged because they can effectively execute strings as code, leading to remote code execution vulnerabilities. Consider using struts tags when processing user-supplied input and templates. Much like the Struts security guide recommending to not use raw `${}` EL expressions, do not call or use the following OGNL packages with user-supplied input: - `com.opensymphony.xwork2.ognl` - `com.opensymphony.xwork2.util` - `com.opensymphony.xwork2.util.reflection` - `org.apache.struts2.util.StrutsUtil` For more information on Struts2 security see: https://struts.apache.org/security/#do-not-use-incoming-untrusted-user-input-in-forced-expression-evaluation

**Why.** Reported as CWE-917. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs.OGNL_INJECTION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// untrusted input (source)
(String $S)
(Map<String, ?> $M)
(Map<String, String> $M)
(Map<String, Object> $M)
$VAR
// flows to sink without sanitization
$VAL
com.opensymphony.xwork2.util.TextParseUtil.shallBeIncluded(...)
com.opensymphony.xwork2.util.TextParseUtil.commaDelimitedStringToSet(...)
(com.opensymphony.xwork2.ognl.OgnlReflectionProvider $P).getGetMethod($CLZ, ...)
(com.opensymphony.xwork2.ognl.OgnlReflectionProvider $P).getSetMethod($CLZ, ...)
(com.opensymphony.xwork2.ognl.OgnlReflectionProvider $P).getField($CLZ, ...)
$MAP
(com.opensymphony.xwork2.util.reflection.ReflectionProvider $P).getGetMethod($CLZ, ...)
(com.opensymphony.xwork2.util.reflection.ReflectionProvider $P).getSetMethod($CLZ, ...)
(com.opensymphony.xwork2.util.reflection.ReflectionProvider $P).getField($CLZ, ...)
$VAR
(org.apache.struts2.util.VelocityStrutsUtil $P).evaluate(...)
org.apache.struts2.util.StrutsUtil.findString(...)
org.apache.struts2.util.StrutsUtil.findValue(..., $VAL)
org.apache.struts2.util.StrutsUtil.getText(...)
org.apache.struts2.util.StrutsUtil.translateVariables(...)
(com.opensymphony.xwork2.util.ValueStack $V).findString(...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.OGNL_INJECTION-1` (metavariables start with `$`):

- `$FUNC(..., $VAR, ...) {
  ...
}`
- `(String $S)`
- `(Map<String, ?> $M)`
- `(Map<String, String> $M)`
- `(Map<String, Object> $M)`
- `$VAR`
- `com.opensymphony.xwork2.util.TextParseUtil.translateVariables($VAL, ...)`
- `$VAL`
- `com.opensymphony.xwork2.util.TextParseUtil.translateVariablesCollection($VAL, ...)`
- `com.opensymphony.xwork2.util.TextParseUtil.shallBeIncluded(...)`
- `com.opensymphony.xwork2.util.TextParseUtil.commaDelimitedStringToSet(...)`
- `(com.opensymphony.xwork2.util.TextParser $P).evaluate($VAR, $VAL, ...)`
- `(com.opensymphony.xwork2.util.OgnlTextParser $P).evaluate($VAR, $VAL, ...)`
- `(com.opensymphony.xwork2.ognl.OgnlReflectionProvider $P).getGetMethod($CLZ, ...)`
- `(com.opensymphony.xwork2.ognl.OgnlReflectionProvider $P).getSetMethod($CLZ, ...)`
- `(com.opensymphony.xwork2.ognl.OgnlReflectionProvider $P).getField($CLZ, ...)`
- `(com.opensymphony.xwork2.ognl.OgnlReflectionProvider $P).setProperties($MAP, ...)`
- `$MAP`
- `(com.opensymphony.xwork2.ognl.OgnlReflectionProvider $P).setProperty($VAL, ...)`
- `(com.opensymphony.xwork2.ognl.OgnlReflectionProvider $P).getValue($VAL, ...)`
- `(com.opensymphony.xwork2.ognl.OgnlReflectionProvider $P).setValue($VAL, ...)`
- `(com.opensymphony.xwork2.util.reflection.ReflectionProvider $P).getGetMethod($CLZ, ...)`
- `(com.opensymphony.xwork2.util.reflection.ReflectionProvider $P).getSetMethod($CLZ, ...)`
- `(com.opensymphony.xwork2.util.reflection.ReflectionProvider $P).getField($CLZ, ...)`
- `(com.opensymphony.xwork2.util.reflection.ReflectionProvider $P).setProperties($MAP, ...)`
- `(com.opensymphony.xwork2.util.reflection.ReflectionProvider $P).setProperty($VAR, ...)`
- `(com.opensymphony.xwork2.util.reflection.ReflectionProvider $P).getValue($VAR, ...)`
- `(com.opensymphony.xwork2.util.reflection.ReflectionProvider $P).setValue($VAR, ...)`
- `(com.opensymphony.xwork2.ognl.OgnlUtil $P).setProperties($MAP, ...)`
- `(com.opensymphony.xwork2.ognl.OgnlUtil $P).setProperty($VAR, ...)`
- `(com.opensymphony.xwork2.ognl.OgnlUtil $P).getValue($VAR, ...)`
- `(com.opensymphony.xwork2.ognl.OgnlUtil $P).setValue($VAR, ...)`
- `(com.opensymphony.xwork2.ognl.OgnlUtil $P).callMethod($VAR, ...)`
- `(com.opensymphony.xwork2.ognl.OgnlUtil $P).compile($VAR, ...)`
- `(org.apache.struts2.util.VelocityStrutsUtil $P).evaluate(...)`
- `org.apache.struts2.util.StrutsUtil.findString(...)`
- `org.apache.struts2.util.StrutsUtil.findValue(..., $VAL)`
- `org.apache.struts2.util.StrutsUtil.getText(...)`
- `org.apache.struts2.util.StrutsUtil.translateVariables(...)`
- `org.apache.struts2.util.StrutsUtil.makeSelectList($VAR, ...)`
- `(org.apache.struts2.views.jsp.ui.OgnlTool $T).findValue($VAR, ...)`
- `(com.opensymphony.xwork2.util.ValueStack $V).findString(...)`
- `(com.opensymphony.xwork2.util.ValueStack $V).findValue($VAR, ...)`
- `(com.opensymphony.xwork2.util.ValueStack $V).setValue($VAR, ...)`
- `(com.opensymphony.xwork2.util.ValueStack $V).setParameter($VAR, ...)`
