---
name: oss/gitlab.eslint.detect-possible-timing-attacks
rubric: safety
severity: should_fix
languages: [javascript]
cwe: [CWE-208]
---

**Rule.** The application was found executing string comparisons using one of `===`, `!==`, `==` or `!=` against security sensitive values. String comparisons like this are not constant time, meaning the first character found not to match in the two strings will immediately exit the conditional statement. This allows an adversary to calculate or observe small timing differences depending on the strings passed to this comparison. This potentially allows an adversary the ability to brute force a string that will match the expected value by monitoring different character values. To remediate this issue, use the `crypto.timingSafeEqual` method when comparing strings. Example using `crypto.timingSafeEqual` to safely compare strings: ``` function constantTimeIsPasswordEqual(userInput) { // Retrieve the password from a secure data store such as a KMS or Hashicorp's vault. const password = getPasswordFromSecureDataStore(); // Use crypto timingSafeEqual to ensure the comparison is done in constant time. return crypto.timingSafeEqual(Buffer.from(userInput, 'utf-8'), Buffer.from(password, 'utf-8')); } ``` For more information on constant time comparison see: - https://nodejs.org/api/crypto.html#crypto_crypto_timingsafeequal_a_b

**Why.** Reported as CWE-208. Ported from opengrep rule `gitlab.eslint.detect-possible-timing-attacks` (generated/oss/security_noaudit_novuln.yaml).

## Examples

Bad:

```text
if (password == $X) {
    ...
}
if ($X == password) {
    ...
}
if (password === $X) {
    ...
}
if ($X === password) {
    ...
}
if (pass == $X) {
    ...
}
if ($X == pass) {
    ...
}
if (pass === $X) {
    ...
}
if ($X === pass) {
    ...
}
if (secret == $X) {
    ...
}
if ($X == secret) {
    ...
}
if (secret === $X) {
    ...
}
if ($X === secret) {
    ...
}
if (api == $X) {
    ...
}
if ($X == api) {
    ...
}
if (api === $X) {
    ...
}
if ($X === api) {
    ...
}
if (apiKey == $X) {
    ...
}
if ($X == apiKey) {
    ...
}
if (apiKey === $X) {
    ...
}
if ($X === apiKey) {
    ...
}
if (apiSecret == $X) {
    ...
}
if ($X == apiSecret) {
    ...
}
if (apiSecret === $X) {
    ...
}
if ($X === apiSecret) {
    ...
}
if (token == $X) {
    ...
}
if ($X == token) {
    ...
}
if (token === $X) {
    ...
}
if ($X === token) {
    ...
}
if (hash == $X) {
    ...
}
if ($X == hash) {
    ...
}
if (hash === $X) {
    ...
}
if ($X === hash) {
    ...
}
if (auth_token == $X) {
    ...
}
if ($X == auth_token) {
    ...
}
if (auth_token === $X) {
    ...
}
if ($X === auth_token) {
    ...
}
if (password != $X) {
    ...
}
if ($X != password) {
    ...
}
if (password !== $X) {
    ...
}
if ($X !== password) {
    ...
}
if (pass != $X) {
    ...
}
if ($X != pass) {
    ...
}
if (pass !== $X) {
    ...
}
if ($X !== pass) {
    ...
}
if (secret != $X) {
    ...
}
if ($X != secret) {
    ...
}
if (secret !== $X) {
    ...
}
if ($X !== secret) {
    ...
}
if (api != $X) {
    ...
}
if ($X != api) {
    ...
}
if (api !== $X) {
    ...
}
if ($X !== api) {
    ...
}
if (apiKey != $X) {
    ...
}
if ($X != apiKey) {
    ...
}
if (apiKey !== $X) {
    ...
}
if ($X !== apiKey) {
    ...
}
if (apiSecret != $X) {
    ...
}
if ($X != apiSecret) {
    ...
}
if (apiSecret !== $X) {
    ...
}
if ($X !== apiSecret) {
    ...
}
if (token != $X) {
    ...
}
if ($X != token) {
    ...
}
if (token !== $X) {
    ...
}
if ($X !== token) {
    ...
}
if (hash != $X) {
    ...
}
if ($X != hash) {
    ...
}
if (hash !== $X) {
    ...
}
if ($X !== hash) {
    ...
}
if (auth_token != $X) {
    ...
}
if ($X != auth_token) {
    ...
}
if (auth_token !== $X) {
    ...
}
if ($X !== auth_token) {
    ...
}
return $X === auth_token;
return auth_token === $X;
return $X === token;
return token === $X;
return $X === hash;
return hash === $X;
return $X === password;
return password === $X;
return $X === pass;
return pass === $X;
return $X === apiKey;
return apiKey === $X;
return $X === apiSecret;
return apiSecret === $X;
return $X === api_key;
return api_key === $X;
return $X === api_secret;
return api_secret === $X;
return $X === secret;
return secret === $X;
return $X === api;
return api === $X;
return $X == auth_token;
return auth_token == $X;
return $X == token;
return token == $X;
return $X == hash;
return hash == $X;
return $X == password;
return password == $X;
return $X == pass;
return pass == $X;
return $X == apiKey;
return apiKey == $X;
return $X == apiSecret;
return apiSecret == $X;
return $X == api_key;
return api_key == $X;
return $X == api_secret;
return api_secret == $X;
return $X == secret;
return secret == $X;
return $X == api;
return api == $X;
return $X !== auth_token;
return auth_token !== $X;
return $X !== token;
return token !== $X;
return $X !== hash;
return hash !== $X;
return $X !== password;
return password !== $X;
return $X !== pass;
return pass !== $X;
return $X !== apiKey;
return apiKey !== $X;
return $X !== apiSecret;
return apiSecret !== $X;
return $X !== api_key;
return api_key !== $X;
return $X !== api_secret;
return api_secret !== $X;
return $X !== secret;
return secret !== $X;
return $X !== api;
return api !== $X;
return $X != auth_token;
return auth_token != $X;
return $X != token;
return token != $X;
return $X != hash;
return hash != $X;
return $X != password;
return password != $X;
return $X != pass;
return pass != $X;
return $X != apiKey;
return apiKey != $X;
return $X != apiSecret;
return apiSecret != $X;
return $X != api_key;
return api_key != $X;
return $X != api_secret;
return api_secret != $X;
return $X != secret;
return secret != $X;
return $X != api;
return api != $X;
```

Good:

```text
if ($Z == null) { ... };
if ($Z === null) { ... };
if ($Z != null) { ... };
if ($Z !== null) { ... };
if ($Q != undefined) { ... };
if ($Q !== undefined) { ... };
if ($Q == undefined) { ... };
if ($Q === undefined) { ... };
return $Y == null;
return $Y === null;
return $Y != null;
return $Y !== null;
return $Y == undefined;
return $Y === undefined;
return $Y != undefined;
return $Y !== undefined;
```

## Detection hints

Literal patterns from opengrep rule `gitlab.eslint.detect-possible-timing-attacks` (metavariables start with `$`):

- `if ($Z == null) { ... };`
- `if ($Z === null) { ... };`
- `if ($Z != null) { ... };`
- `if ($Z !== null) { ... };`
- `if ($Q != undefined) { ... };`
- `if ($Q !== undefined) { ... };`
- `if ($Q == undefined) { ... };`
- `if ($Q === undefined) { ... };`
- `return $Y == null;`
- `return $Y === null;`
- `return $Y != null;`
- `return $Y !== null;`
- `return $Y == undefined;`
- `return $Y === undefined;`
- `return $Y != undefined;`
- `return $Y !== undefined;`
- `if (password == $X) {
    ...
}`
- `if ($X == password) {
    ...
}`
- `if (password === $X) {
    ...
}`
- `if ($X === password) {
    ...
}`
- `if (pass == $X) {
    ...
}`
- `if ($X == pass) {
    ...
}`
- `if (pass === $X) {
    ...
}`
- `if ($X === pass) {
    ...
}`
- `if (secret == $X) {
    ...
}`
- `if ($X == secret) {
    ...
}`
- `if (secret === $X) {
    ...
}`
- `if ($X === secret) {
    ...
}`
- `if (api == $X) {
    ...
}`
- `if ($X == api) {
    ...
}`
- `if (api === $X) {
    ...
}`
- `if ($X === api) {
    ...
}`
- `if (apiKey == $X) {
    ...
}`
- `if ($X == apiKey) {
    ...
}`
- `if (apiKey === $X) {
    ...
}`
- `if ($X === apiKey) {
    ...
}`
- `if (apiSecret == $X) {
    ...
}`
- `if ($X == apiSecret) {
    ...
}`
- `if (apiSecret === $X) {
    ...
}`
- `if ($X === apiSecret) {
    ...
}`
- `if (token == $X) {
    ...
}`
- `if ($X == token) {
    ...
}`
- `if (token === $X) {
    ...
}`
- `if ($X === token) {
    ...
}`
- `if (hash == $X) {
    ...
}`
- `if ($X == hash) {
    ...
}`
- `if (hash === $X) {
    ...
}`
- `if ($X === hash) {
    ...
}`
- `if (auth_token == $X) {
    ...
}`
- `if ($X == auth_token) {
    ...
}`
- `if (auth_token === $X) {
    ...
}`
- `if ($X === auth_token) {
    ...
}`
- `if (password != $X) {
    ...
}`
- `if ($X != password) {
    ...
}`
- `if (password !== $X) {
    ...
}`
- `if ($X !== password) {
    ...
}`
- `if (pass != $X) {
    ...
}`
- `if ($X != pass) {
    ...
}`
- `if (pass !== $X) {
    ...
}`
- `if ($X !== pass) {
    ...
}`
- `if (secret != $X) {
    ...
}`
- `if ($X != secret) {
    ...
}`
- `if (secret !== $X) {
    ...
}`
- `if ($X !== secret) {
    ...
}`
- `if (api != $X) {
    ...
}`
- `if ($X != api) {
    ...
}`
- `if (api !== $X) {
    ...
}`
- `if ($X !== api) {
    ...
}`
- `if (apiKey != $X) {
    ...
}`
- `if ($X != apiKey) {
    ...
}`
- `if (apiKey !== $X) {
    ...
}`
- `if ($X !== apiKey) {
    ...
}`
- `if (apiSecret != $X) {
    ...
}`
- `if ($X != apiSecret) {
    ...
}`
- `if (apiSecret !== $X) {
    ...
}`
- `if ($X !== apiSecret) {
    ...
}`
- `if (token != $X) {
    ...
}`
- `if ($X != token) {
    ...
}`
- `if (token !== $X) {
    ...
}`
- `if ($X !== token) {
    ...
}`
- `if (hash != $X) {
    ...
}`
- `if ($X != hash) {
    ...
}`
- `if (hash !== $X) {
    ...
}`
- `if ($X !== hash) {
    ...
}`
- `if (auth_token != $X) {
    ...
}`
- `if ($X != auth_token) {
    ...
}`
- `if (auth_token !== $X) {
    ...
}`
- `if ($X !== auth_token) {
    ...
}`
- `return $X === auth_token;`
- `return auth_token === $X;`
- `return $X === token;`
- `return token === $X;`
- `return $X === hash;`
- `return hash === $X;`
- `return $X === password;`
- `return password === $X;`
- `return $X === pass;`
- `return pass === $X;`
- `return $X === apiKey;`
- `return apiKey === $X;`
- `return $X === apiSecret;`
- `return apiSecret === $X;`
- `return $X === api_key;`
- `return api_key === $X;`
- `return $X === api_secret;`
- `return api_secret === $X;`
- `return $X === secret;`
- `return secret === $X;`
- `return $X === api;`
- `return api === $X;`
- `return $X == auth_token;`
- `return auth_token == $X;`
- `return $X == token;`
- `return token == $X;`
- `return $X == hash;`
- `return hash == $X;`
- `return $X == password;`
- `return password == $X;`
- `return $X == pass;`
- `return pass == $X;`
- `return $X == apiKey;`
- `return apiKey == $X;`
- `return $X == apiSecret;`
- `return apiSecret == $X;`
- `return $X == api_key;`
- `return api_key == $X;`
- `return $X == api_secret;`
- `return api_secret == $X;`
- `return $X == secret;`
- `return secret == $X;`
- `return $X == api;`
- `return api == $X;`
- `return $X !== auth_token;`
- `return auth_token !== $X;`
- `return $X !== token;`
- `return token !== $X;`
- `return $X !== hash;`
- `return hash !== $X;`
- `return $X !== password;`
- `return password !== $X;`
- `return $X !== pass;`
- `return pass !== $X;`
- `return $X !== apiKey;`
- `return apiKey !== $X;`
- `return $X !== apiSecret;`
- `return apiSecret !== $X;`
- `return $X !== api_key;`
- `return api_key !== $X;`
- `return $X !== api_secret;`
- `return api_secret !== $X;`
- `return $X !== secret;`
- `return secret !== $X;`
- `return $X !== api;`
- `return api !== $X;`
- `return $X != auth_token;`
- `return auth_token != $X;`
- `return $X != token;`
- `return token != $X;`
- `return $X != hash;`
- `return hash != $X;`
- `return $X != password;`
- `return password != $X;`
- `return $X != pass;`
- `return pass != $X;`
- `return $X != apiKey;`
- `return apiKey != $X;`
- `return $X != apiSecret;`
- `return apiSecret != $X;`
- `return $X != api_key;`
- `return api_key != $X;`
- `return $X != api_secret;`
- `return api_secret != $X;`
- `return $X != secret;`
- `return secret != $X;`
- `return $X != api;`
- `return api != $X;`
