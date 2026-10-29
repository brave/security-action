---
name: oss/gitlab.security-code-scan.SCS0032-1.SCS0033-1.SCS0034-1
rubric: safety
severity: should_fix
languages: [csharp]
---

**Rule.** The application's `PasswordValidator.RequiredLength` property allows passwords to be less than 8 characters. Consider requiring a length of at least 8 or more characters to reduce the chance of passwords being brute forced. Example of setting the RequiredLength to 8 in ASP.NET Core Identity: ``` builder.Services.Configure<IdentityOptions>(options => { // Default Password settings. options.Password.RequireDigit = true; options.Password.RequireLowercase = true; options.Password.RequireNonAlphanumeric = true; options.Password.RequireUppercase = true; options.Password.RequiredLength = 8; options.Password.RequiredUniqueChars = 1; }); ``` For more information on configuring ASP.NET Core Identity see: https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-configuration

**Why.** Reported as CWE-521. Ported from opengrep rule `gitlab.security_code_scan.SCS0032-1.SCS0033-1.SCS0034-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
new PasswordValidator
{
  ...,
};
new PasswordValidator
{
  ...,
  RequiredLength = $LEN,
  ...,
};
```

Good:

```text
new PasswordValidator
{
  ...,
  RequireNonLetterOrDigit = true,
  ...,
};
new PasswordValidator
{
  ...,
  RequireDigit = true,
  ...,
};
new PasswordValidator
{
  ...,
  RequireLowercase = true,
  ...,
};
new PasswordValidator
{
  ...,
  RequireUppercase = true,
  ...,
};
```

## Detection hints

Literal patterns from opengrep rule `gitlab.security_code_scan.SCS0032-1.SCS0033-1.SCS0034-1` (metavariables start with `$`):

- `new PasswordValidator
{
  ...,
};`
- `new PasswordValidator
{
  ...,
  RequiredLength = $LEN,
  ...,
};`
- `new PasswordValidator
{
  ...,
  RequireNonLetterOrDigit = true,
  ...,
};`
- `new PasswordValidator
{
  ...,
  RequireDigit = true,
  ...,
};`
- `new PasswordValidator
{
  ...,
  RequireLowercase = true,
  ...,
};`
- `new PasswordValidator
{
  ...,
  RequireUppercase = true,
  ...,
};`
