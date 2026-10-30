---
name: oss/gitlab.find-sec-bugs-scala.OGNL-INJECTION-1
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-917]
---

**Rule.** "A expression is built with a dynamic value. The source of the value(s) should be verified to avoid that unfiltered values fall into this risky code evaluation."

**Why.** Reported as CWE-917. Ported from opengrep rule `gitlab.find_sec_bugs_scala.OGNL_INJECTION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
com.opensymphony.xwork2.util.TextParseUtil.translateVariables(..., $VAR, ...)
com.opensymphony.xwork2.util.TextParseUtil.translateVariablesCollection(..., $VAR, ...)
com.opensymphony.xwork2.util.TextParseUtil.shallBeIncluded(..., $VAR, ...)
com.opensymphony.xwork2.util.TextParseUtil.commaDelimitedStringToSet(..., $VAR, ...)
($P:com.opensymphony.xwork2.util.TextParser).evaluate(..., $VAR, ...)
($P:com.opensymphony.xwork2.util.OgnlTextParser).evaluate(..., $VAR, ...)
($P:com.opensymphony.xwork2.ognl.OgnlReflectionProvider).getGetMethod(..., $VAR, ...)
($P:com.opensymphony.xwork2.ognl.OgnlReflectionProvider).getSetMethod(..., $VAR, ...)
($P:com.opensymphony.xwork2.ognl.OgnlReflectionProvider).getField(..., $VAR, ...)
($P:com.opensymphony.xwork2.ognl.OgnlReflectionProvider).setProperties(..., $VAR, ...)
($P:com.opensymphony.xwork2.ognl.OgnlReflectionProvider).setProperty(...,$VAR, ...)
($P:com.opensymphony.xwork2.ognl.OgnlReflectionProvider).getValue(...,$VAR, ...)
($P:com.opensymphony.xwork2.ognl.OgnlReflectionProvider).setValue(...,$VAR, ...)
($P:com.opensymphony.xwork2.util.reflection.ReflectionProvider).getGetMethod(..., $VAR, ...)
($P:com.opensymphony.xwork2.util.reflection.ReflectionProvider).getSetMethod(..., $VAR, ...)
($P:com.opensymphony.xwork2.util.reflection.ReflectionProvider).getField(..., $VAR, ...)
($P:com.opensymphony.xwork2.util.reflection.ReflectionProvider).setProperties(..., $VAR, ...)
($P:com.opensymphony.xwork2.util.reflection.ReflectionProvider).setProperty(..., $VAR, ...)
($P:com.opensymphony.xwork2.util.reflection.ReflectionProvider).getValue(..., $VAR, ...)
($P:com.opensymphony.xwork2.util.reflection.ReflectionProvider).setValue(..., $VAR, ...)
($P:com.opensymphony.xwork2.ognl.OgnlUtil).setProperties(..., $VAR, ...)
($P:com.opensymphony.xwork2.ognl.OgnlUtil).setProperty(..., $VAR, ...)
($P:com.opensymphony.xwork2.ognl.OgnlUtil).getValue(..., $VAR, ...)
($P:com.opensymphony.xwork2.ognl.OgnlUtil).setValue(..., $VAR, ...)
($P:com.opensymphony.xwork2.ognl.OgnlUtil).callMethod(..., $VAR, ...)
($P:com.opensymphony.xwork2.ognl.OgnlUtil).compile(..., $VAR, ...)
($P:org.apache.struts2.util.VelocityStrutsUtil).evaluate(...)
org.apache.struts2.util.StrutsUtil.findString(...)
org.apache.struts2.util.StrutsUtil.findValue(..., $VAL)
org.apache.struts2.util.StrutsUtil.getText(...)
org.apache.struts2.util.StrutsUtil.translateVariables(...)
org.apache.struts2.util.StrutsUtil.makeSelectList(..., $VAR, ...)
($T:org.apache.struts2.views.jsp.ui.OgnlTool).findValue(..., $VAR, ...)
($V:com.opensymphony.xwork2.util.ValueStack).findString(...)
($V:com.opensymphony.xwork2.util.ValueStack).findValue(..., $VAR, ...)
($V:com.opensymphony.xwork2.util.ValueStack).setValue(..., $VAR, ...)
($V:com.opensymphony.xwork2.util.ValueStack).setParameter(..., $VAR, ...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.OGNL_INJECTION-1` (metavariables start with `$`):

- `def $FUNC(..., $VAR: String, ...): $TYPE = {
  ...
}`
- `def $FUNC(..., $VAR: Map[$K,$V], ...): $TYPE = {
  ...
}`
- `def $FUNC(..., $VAR: java.util.HashMap[$K,$V], ...): $TYPE = {
  ...
}`
- `com.opensymphony.xwork2.util.TextParseUtil.translateVariables(..., $VAR, ...)`
- `com.opensymphony.xwork2.util.TextParseUtil.translateVariablesCollection(..., $VAR, ...)`
- `com.opensymphony.xwork2.util.TextParseUtil.shallBeIncluded(..., $VAR, ...)`
- `com.opensymphony.xwork2.util.TextParseUtil.commaDelimitedStringToSet(..., $VAR, ...)`
- `($P:com.opensymphony.xwork2.util.TextParser).evaluate(..., $VAR, ...)`
- `($P:com.opensymphony.xwork2.util.OgnlTextParser).evaluate(..., $VAR, ...)`
- `($P:com.opensymphony.xwork2.ognl.OgnlReflectionProvider).getGetMethod(..., $VAR, ...)`
- `($P:com.opensymphony.xwork2.ognl.OgnlReflectionProvider).getSetMethod(..., $VAR, ...)`
- `($P:com.opensymphony.xwork2.ognl.OgnlReflectionProvider).getField(..., $VAR, ...)`
- `($P:com.opensymphony.xwork2.ognl.OgnlReflectionProvider).setProperties(..., $VAR, ...)`
- `($P:com.opensymphony.xwork2.ognl.OgnlReflectionProvider).setProperty(...,$VAR, ...)`
- `($P:com.opensymphony.xwork2.ognl.OgnlReflectionProvider).getValue(...,$VAR, ...)`
- `($P:com.opensymphony.xwork2.ognl.OgnlReflectionProvider).setValue(...,$VAR, ...)`
- `($P:com.opensymphony.xwork2.util.reflection.ReflectionProvider).getGetMethod(..., $VAR, ...)`
- `($P:com.opensymphony.xwork2.util.reflection.ReflectionProvider).getSetMethod(..., $VAR, ...)`
- `($P:com.opensymphony.xwork2.util.reflection.ReflectionProvider).getField(..., $VAR, ...)`
- `($P:com.opensymphony.xwork2.util.reflection.ReflectionProvider).setProperties(..., $VAR, ...)`
- `($P:com.opensymphony.xwork2.util.reflection.ReflectionProvider).setProperty(..., $VAR, ...)`
- `($P:com.opensymphony.xwork2.util.reflection.ReflectionProvider).getValue(..., $VAR, ...)`
- `($P:com.opensymphony.xwork2.util.reflection.ReflectionProvider).setValue(..., $VAR, ...)`
- `($P:com.opensymphony.xwork2.ognl.OgnlUtil).setProperties(..., $VAR, ...)`
- `($P:com.opensymphony.xwork2.ognl.OgnlUtil).setProperty(..., $VAR, ...)`
- `($P:com.opensymphony.xwork2.ognl.OgnlUtil).getValue(..., $VAR, ...)`
- `($P:com.opensymphony.xwork2.ognl.OgnlUtil).setValue(..., $VAR, ...)`
- `($P:com.opensymphony.xwork2.ognl.OgnlUtil).callMethod(..., $VAR, ...)`
- `($P:com.opensymphony.xwork2.ognl.OgnlUtil).compile(..., $VAR, ...)`
- `($P:org.apache.struts2.util.VelocityStrutsUtil).evaluate(...)`
- `org.apache.struts2.util.StrutsUtil.findString(...)`
- `org.apache.struts2.util.StrutsUtil.findValue(..., $VAL)`
- `org.apache.struts2.util.StrutsUtil.getText(...)`
- `org.apache.struts2.util.StrutsUtil.translateVariables(...)`
- `org.apache.struts2.util.StrutsUtil.makeSelectList(..., $VAR, ...)`
- `($T:org.apache.struts2.views.jsp.ui.OgnlTool).findValue(..., $VAR, ...)`
- `($V:com.opensymphony.xwork2.util.ValueStack).findString(...)`
- `($V:com.opensymphony.xwork2.util.ValueStack).findValue(..., $VAR, ...)`
- `($V:com.opensymphony.xwork2.util.ValueStack).setValue(..., $VAR, ...)`
- `($V:com.opensymphony.xwork2.util.ValueStack).setParameter(..., $VAR, ...)`
