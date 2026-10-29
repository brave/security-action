---
name: oss/mobsf.mobsfscan.android.logging.android-logging
rubric: correctness
severity: nit
languages: [java]
---

**Rule.** The App logs information. Please ensure that sensitive information is never logged.

**Why.** Reported as cwe-532. Ported from opengrep rule `mobsf.mobsfscan.android.logging.android_logging` (generated/oss/others.yaml).

## Examples

Bad:

```java
Log.$D($T, $X + "...", ...);
Log.$D($T, "..." + $X + "...", ...);
Log.$D($T, "..." + $X, ...);
$Y = $Z;
...
Log.$D($T,<... $Y ...>, ...);
System.out.print(...);
System.err.print(...);
System.out.println(...);
System.err.println(...);
```

Good:

```java
System.out.print();
System.out.println();
System.err.print();
System.err.println();
Log.$D("...", "...", ...);
Log.$D($T, "...", ...);
System.out.print("...");
System.out.println("...");
System.err.print("...");
System.err.println("...");
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.android.logging.android_logging` (metavariables start with `$`):

- `System.out.print();`
- `System.out.println();`
- `System.err.print();`
- `System.err.println();`
- `Log.$D("...", "...", ...);`
- `Log.$D($T, "...", ...);`
- `System.out.print("...");`
- `System.out.println("...");`
- `System.err.print("...");`
- `System.err.println("...");`
- `Log.$D($T, $X + "...", ...);`
- `Log.$D($T, "..." + $X + "...", ...);`
- `Log.$D($T, "..." + $X, ...);`
- `$Y = $Z;
...
Log.$D($T,<... $Y ...>, ...);`
- `System.out.print(...);`
- `System.err.print(...);`
- `System.out.println(...);`
- `System.err.println(...);`
