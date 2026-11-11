---
name: oss/mobsf.mobsfscan.injection.sqlite-injection.sqlite-injection
rubric: correctness
severity: should_fix
languages: [java]
cwe: [cwe-78]
---

**Rule.** App uses SQLite Database and execute raw SQL query. Untrusted user input in raw SQL queries can cause SQL Injection. Also sensitive information should be encrypted and written to the database.

**Why.** Reported as cwe-78. Ported from opengrep rule `mobsf.mobsfscan.injection.sqlite_injection.sqlite_injection` (generated/oss/others.yaml).

## Examples

Bad:

```java
$DB.rawQuery("..." + $INP + "..." , ...);
$DB.rawQuery($INP + "..." , ... );
$DB.rawQuery($INP + "..." + $INP2, ...);
$DB.rawQuery($INP + "..." + $INP2 + "...", ...);
$DB.execSQL($INP + "..." , ...);
$DB.execSQL("..." + $INP + "..." , ...);
$DB.execSQL($INP + "..." + $INP2, ...);
$DB.execSQL($INP + "..." + $INP2 + "...", ...);
```

Good:

```java
$DB.execSQL("..." , ...);
$DB.rawQuery("..." , ...);
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.injection.sqlite_injection.sqlite_injection` (metavariables start with `$`):

- `$DB.execSQL("..." , ...);`
- `$DB.rawQuery("..." , ...);`
- `$DB.rawQuery("..." + $INP + "..." , ...);`
- `$DB.rawQuery($INP + "..." , ... );`
- `$DB.rawQuery($INP + "..." + $INP2, ...);`
- `$DB.rawQuery($INP + "..." + $INP2 + "...", ...);`
- `$DB.execSQL($INP + "..." , ...);`
- `$DB.execSQL("..." + $INP + "..." , ...);`
- `$DB.execSQL($INP + "..." + $INP2, ...);`
- `$DB.execSQL($INP + "..." + $INP2 + "...", ...);`
