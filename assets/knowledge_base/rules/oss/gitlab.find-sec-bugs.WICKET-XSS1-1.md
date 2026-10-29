---
name: oss/gitlab.find-sec-bugs.WICKET-XSS1-1
rubric: safety
severity: should_fix
languages: [java]
cwe: [CWE-79]
---

**Rule.** The application is disabling Wicket's string escaping functionality by calling `setEscapeModelStrings(false)`. This could lead to Cross Site Scripting (XSS) if used with user-supplied input. XSS is an attack which exploits a web application or system to treat user input as markup or script code. It is important to encode the data depending on the specific context it is used in. There are at least six context types: - Inside HTML tags `<div>context 1</div>` - Inside attributes: `<div class="context 2"></div>` - Inside event attributes `<button onclick="context 3">button</button>` - Inside script blocks: `<script>var x = "context 4"</script>` - Unsafe element HTML assignment: `element.innerHTML = "context 5"` - Inside URLs: `<iframe src="context 6"></iframe><a href="context 6">link</a>` Script blocks alone have multiple ways they need to be encoded. Extra care must be taken if user input is ever output inside of script tags. User input that is displayed within the application must be encoded, sanitized or validated to ensure it cannot be treated as HTML or executed as JavaScript code. Care must also be taken to not mix server-side templating with client-side templating, as the server-side templating will not encode things like {{ 7*7 }} which may execute client-side templating features. It is _NOT_ advised to encode user input prior to inserting into a data store. The data will need to be encoded depending on context of where it is output. It is much safer to force the displaying system to handle the encoding and not attempt to guess how it should be encoded. Use Wicket's built in escaping feature by calling `Component.setEscapeModelStrings(true);` For more information on Wicket components see: - https://nightlies.apache.org/wicket/apidocs/9.x/org/apache/wicket/Component.html For more information on XSS see OWASP: - https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html

**Why.** Reported as CWE-79. Ported from opengrep rule `gitlab.find_sec_bugs.WICKET_XSS1-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
$OBJ.setEscapeModelStrings(false);
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.WICKET_XSS1-1` (metavariables start with `$`):

- `import org.apache.wicket.$A;
...`
- `$OBJ.setEscapeModelStrings(false);`
