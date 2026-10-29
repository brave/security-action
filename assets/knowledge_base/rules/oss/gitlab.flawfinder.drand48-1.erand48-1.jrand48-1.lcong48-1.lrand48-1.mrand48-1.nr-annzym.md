---
name: oss/gitlab.flawfinder.drand48-1.erand48-1.jrand48-1.lcong48-1.lrand48-1.mrand48-1.nr-annzym
rubric: safety
severity: should_fix
languages: [c, cpp]
cwe: [CWE-327]
---

**Rule.** The detected function is not sufficient at generating security-related random numbers, such as those used in key and nonce creation. Consider using the libsodium library's `randombytes_random` function instead. More information on libsodium's random number generators can be found here: https://libsodium.gitbook.io/doc/generating_random_data. If FIPS validation is required, consider using OpenSSLs `RAND_bytes` family of functions after enabling the `FIPS_mode_set`. For more information on OpenSSL random numbers please see: https://wiki.openssl.org/index.php/Random_Numbers

**Why.** Reported as CWE-327. Ported from opengrep rule `gitlab.flawfinder.drand48-1.erand48-1.jrand48-1.lcong48-1.lrand48-1.mrand48-1.nrand48-1.random-1.seed48-1.setstate-1.srand-1.strfry-1.srandom-1.g_rand_boolean-1.g_rand_int-1.g_rand_int_range-1.g_rand_double-1.g_rand_double_range-1.g_random_boolean-1.g_random_int-1.g_random_int_range-1.g_random_double-1.g_random_double_range-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.drand48-1.erand48-1.jrand48-1.lcong48-1.lrand48-1.mrand48-1.nrand48-1.random-1.seed48-1.setstate-1.srand-1.strfry-1.srandom-1.g_rand_boolean-1.g_rand_int-1.g_rand_int_range-1.g_rand_double-1.g_rand_double_range-1.g_random_boolean-1.g_random_int-1.g_random_int_range-1.g_random_double-1.g_random_double_range-1` (metavariables start with `$`):

- `drand48(...)`
- `erand48(...)`
- `jrand48(...)`
- `lcong48(...)`
- `lrand48(...)`
- `mrand48(...)`
- `nrand48(...)`
- `random(...)`
- `seed48(...)`
- `setstate(...)`
- `srand(...)`
- `strfry(...)`
- `srandom(...)`
- `g_rand_boolean(...)`
- `g_rand_int(...)`
- `g_rand_int_range(...)`
- `g_rand_double(...)`
- `g_rand_double_range(...)`
- `g_random_boolean(...)`
- `g_random_int(...)`
- `g_random_int_range(...)`
- `g_random_double(...)`
- `g_random_double_range(...)`
- `(long|short|double|int|float|void)\s(\*|)(\s|)(seed48|lcong48)(\(.*\))\;`
