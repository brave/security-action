---
name: oss/gitlab.security-code-scan.SCS0029-1
rubric: safety
severity: should_fix
languages: [csharp]
---

**Rule.** Cross Site Scripting (XSS) is an attack which exploits a web application or system to treat user input as markup or script code. It is important to encode the data depending on the specific context it is used in. There are at least six context types: - Inside HTML tags `<div>context 1</div>` - Inside attributes: `<div class="context 2"></div>` - Inside event attributes `<button onclick="context 3">button</button>` - Inside script blocks: `<script>var x = "context 4"</script>` - Unsafe element HTML assignment: `element.innerHTML = "context 5"` - Inside URLs: `<iframe src="context 6"></iframe><a href="context 6">link</a>` Script blocks alone have multiple ways they need to be encoded. Extra care must be taken if user input is ever output inside of script tags. User input that is displayed within the application must be encoded, sanitized or validated to ensure it cannot be treated as HTML or executed as Javascript code. Care must also be taken to not mix server-side templating with client-side templating, as the server-side templating will not encode things like {{ 7*7 }} which may execute client-side templating features. It is _NOT_ advised to encode user input prior to inserting into a data store. The data will need to be encoded depending on context of where it is output. It is much safer to force the displaying system to handle the encoding and not attempt to guess how it should be encoded. Consider using built-in framework capabilities for automatically encoding user input. Depending on output context, consider using the following `System.Text.Encodings.Web` encoders: - [HtmlEncoder](https://learn.microsoft.com/en-us/dotnet/api/system.text.encodings.web.htmlencoder) - [JavaScriptEncoder](https://learn.microsoft.com/en-us/dotnet/api/system.text.encodings.web.javascriptencoder) - [UrlEncoder](https://learn.microsoft.com/en-us/dotnet/api/system.text.encodings.web.urlencoder) For more information on protecting ASP.NET Core applications from XSS see: https://learn.microsoft.com/en-us/aspnet/core/security/cross-site-scripting#accessing-encoders-in-code

**Why.** Reported as CWE-79. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.security_code_scan.SCS0029-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// untrusted input (source)
$PARAM
// flows to sink without sanitization
(System.Web.Mvc.HtmlHelper $E).Raw(...)
(Microsoft.AspNetCore.Mvc.Rendering.IHtmlHelper $E).Raw(...)
(System.Web.HttpResponse $E).AddHeader(...)
(System.Web.HttpResponse $E).AppendHeader(...)
(System.Web.HttpResponse $E).Write(...)
(System.Web.HttpResponse $E).BinaryWrite(...)
(System.Web.HttpResponse $E).TransmitFile(...)
(System.Web.HttpResponse $E).WriteFile(...)
(System.Web.HttpResponseBase $E).AddHeader(...)
(System.Web.HttpResponseBase $E).AppendHeader(...)
(System.Web.HttpResponseBase $E).Write(...)
(System.Web.HttpResponseBase $E).BinaryWrite(...)
(System.Web.HttpResponseBase $E).WriteFile(...)
(System.Web.UI.HtmlTextWriter $E).AddAttribute(...)
(System.Web.UI.HtmlTextWriter $E).AddStyleAttribute(...)
(System.Web.UI.HtmlTextWriter $E).RenderBeginTag(...)
(System.Web.UI.HtmlTextWriter $E).Write(...)
(System.Web.UI.HtmlTextWriter $E).WriteAttribute(...)
(System.Web.UI.HtmlTextWriter $E).WriteBeginTag(...)
(System.Web.UI.HtmlTextWriter $E).WriteEndTag(...)
(System.Web.UI.HtmlTextWriter $E).WriteFullBeginTag(...)
(System.Web.UI.HtmlTextWriter $E).WriteStyleAttribute(...)
(System.Web.UI.ClientScriptManager $E).RegisterStartupScript(...)
(System.Web.UI.ClientScriptManager $E).RegisterClientScriptBlock(...)
(System.Web.UI.Page $E).RegisterStartupScript(...)
(System.Web.UI.Page $E).RegisterClientScriptBlock(...)
return ...;
```

Good:

```text
$CLASS.$FUNC(...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.security_code_scan.SCS0029-1` (metavariables start with `$`):

- `$PARAM`
- `^(Http)`
- `public class $CLASS : Controller {
  ...
}`
- `[$HTTP_ANNO]
public string $METHOD(...,$PARAM,...){...}`
- `(SerializeObject|HtmlAttributeEncode|HtmlEncode|HtmlFormUrlEncode|UrlEncode|UrlPathEncode|XmlAttributeEncode|XmlEncode|Encode)`
- `$CLASS.$FUNC(...)`
- `(System.Web.Mvc.HtmlHelper $E).Raw(...)`
- `(Microsoft.AspNetCore.Mvc.Rendering.IHtmlHelper $E).Raw(...)`
- `(System.Web.HttpResponse $E).AddHeader(...)`
- `(System.Web.HttpResponse $E).AppendHeader(...)`
- `(System.Web.HttpResponse $E).Write(...)`
- `(System.Web.HttpResponse $E).BinaryWrite(...)`
- `(System.Web.HttpResponse $E).TransmitFile(...)`
- `(System.Web.HttpResponse $E).WriteFile(...)`
- `(System.Web.HttpResponseBase $E).AddHeader(...)`
- `(System.Web.HttpResponseBase $E).AppendHeader(...)`
- `(System.Web.HttpResponseBase $E).Write(...)`
- `(System.Web.HttpResponseBase $E).BinaryWrite(...)`
- `(System.Web.HttpResponseBase $E).WriteFile(...)`
- `(System.Web.UI.HtmlTextWriter $E).AddAttribute(...)`
- `(System.Web.UI.HtmlTextWriter $E).AddStyleAttribute(...)`
- `(System.Web.UI.HtmlTextWriter $E).RenderBeginTag(...)`
- `(System.Web.UI.HtmlTextWriter $E).Write(...)`
- `(System.Web.UI.HtmlTextWriter $E).WriteAttribute(...)`
- `(System.Web.UI.HtmlTextWriter $E).WriteBeginTag(...)`
- `(System.Web.UI.HtmlTextWriter $E).WriteEndTag(...)`
- `(System.Web.UI.HtmlTextWriter $E).WriteFullBeginTag(...)`
- `(System.Web.UI.HtmlTextWriter $E).WriteStyleAttribute(...)`
- `(System.Web.UI.ClientScriptManager $E).RegisterStartupScript(...)`
- `(System.Web.UI.ClientScriptManager $E).RegisterClientScriptBlock(...)`
- `(System.Web.UI.Page $E).RegisterStartupScript(...)`
- `(System.Web.UI.Page $E).RegisterClientScriptBlock(...)`
- `return ...;`
