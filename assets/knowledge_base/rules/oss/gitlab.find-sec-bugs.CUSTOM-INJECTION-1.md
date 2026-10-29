---
name: oss/gitlab.find-sec-bugs.CUSTOM-INJECTION-1
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** SQL Injection is a critical vulnerability that can lead to data or system compromise. By dynamically generating SQL query strings, user input may be able to influence the logic of the SQL statement. This could lead to an adversary accessing information they should not have access to, or in some circumstances, being able to execute OS functionality or code. Replace all dynamically generated SQL queries with parameterized queries. In situations where dynamic queries must be created, never use direct user input, but instead use a map or dictionary of valid values and resolve them using a user-supplied key. For example, some database drivers do not allow parameterized queries for `>` or `<` comparison operators. In these cases, do not use a user supplied `>` or `<` value, but rather have the user supply a `gt` or `lt` value. The alphabetical values are then used to look up the `>` and `<` values to be used in the construction of the dynamic query. The same goes for other queries where column or table names are required but cannot be parameterized. Example using `PreparedStatement` queries: ``` // Some userInput String userInput = "someUserInput"; // Your connection string String url = "..."; // Get a connection from the DB via the DriverManager Connection conn = DriverManager.getConnection(url); // Create a prepared statement PreparedStatement st = conn.prepareStatement("SELECT name FROM table where name=?"); // Set each parameters value by the index (starting from 1) st.setString(1, userInput); // Execute query and get the result set ResultSet rs = st.executeQuery(); // Iterate over results while (rs.next()) { // Get result for this row at the provided column number (starting from 1) String result = rs.getString(1); // ... } // Close the ResultSet rs.close(); // Close the PreparedStatement st.close(); ``` For more information on SQL Injection see OWASP: https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html

**Why.** Reported as CWE-89. Ported from opengrep rule `gitlab.find_sec_bugs.CUSTOM_INJECTION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
$QUERY = ... + $VAR + ...;
...
$ST.executeQuery($QUERY);
$QUERY = ... + $VAR ;
...
$ST.executeQuery($QUERY);
$QUERY = String.format("...",...,$VAR,...);
...
$ST.executeQuery($QUERY);
$ST.executeQuery((StringBuilder $SB).toString());
$ST.executeQuery(... + $VAR + ...);
$ST.executeQuery(... + $VAR);
$ST.executeQuery(...,String.format("...",...,$VAR,...), ...);
(java.sql.Statement $ST)
(org.apache.turbine.om.peer.BasePeer $ST)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.CUSTOM_INJECTION-1` (metavariables start with `$`):

- `$QUERY = ... + $VAR + ...;
...
$ST.executeQuery($QUERY);`
- `$QUERY = ... + $VAR ;
...
$ST.executeQuery($QUERY);`
- `$QUERY = String.format("...",...,$VAR,...);
...
$ST.executeQuery($QUERY);`
- `$ST.executeQuery((StringBuilder $SB).toString());`
- `$ST.executeQuery(... + $VAR + ...);`
- `$ST.executeQuery(... + $VAR);`
- `$ST.executeQuery(...,String.format("...",...,$VAR,...), ...);`
- `(java.sql.Statement $ST)`
- `(org.apache.turbine.om.peer.BasePeer $ST)`
