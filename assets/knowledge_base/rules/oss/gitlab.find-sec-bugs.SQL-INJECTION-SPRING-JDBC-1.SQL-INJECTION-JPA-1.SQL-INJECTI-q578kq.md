---
name: oss/gitlab.find-sec-bugs.SQL-INJECTION-SPRING-JDBC-1.SQL-INJECTION-JPA-1.SQL-INJECTI-q578kq
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** SQL Injection is a critical vulnerability that can lead to data or system compromise. By dynamically generating SQL query strings, user input may be able to influence the logic of the SQL statement. This could lead to an adversary accessing information they should not have access to, or in some circumstances, being able to execute OS functionality or code. Replace all dynamically generated SQL queries with parameterized queries. In situations where dynamic queries must be created, never use direct user input, but instead use a map or dictionary of valid values and resolve them using a user supplied key. For example, some database drivers do not allow parameterized queries for `>` or `<` comparison operators. In these cases, do not use a user supplied `>` or `<` value, but rather have the user supply a `gt` or `lt` value. The alphabetical values are then used to look up the `>` and `<` values to be used in the construction of the dynamic query. The same goes for other queries where column or table names are required but cannot be parameterized. Example using `PreparedStatement` queries: ``` // Some userInput String userInput = "someUserInput"; // Your connection string String url = "..."; // Get a connection from the DB via the DriverManager Connection conn = DriverManager.getConnection(url); // Create a prepared statement PreparedStatement st = conn.prepareStatement("SELECT name FROM table where name=?"); // Set each parameters value by the index (starting from 1) st.setString(1, userInput); // Execute query and get the result set ResultSet rs = st.executeQuery(); // Iterate over results while (rs.next()) { // Get result for this row at the provided column number (starting from 1) String result = rs.getString(1); // ... } // Close the ResultSet rs.close(); // Close the PreparedStatement st.close(); ``` For more information on SQL Injection see OWASP: https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html

**Why.** Reported as CWE-89. Ported from opengrep rule `gitlab.find_sec_bugs.SQL_INJECTION_SPRING_JDBC-1.SQL_INJECTION_JPA-1.SQL_INJECTION_JDO-1.SQL_INJECTION_JDBC-1.SQL_NONCONSTANT_STRING_PASSED_TO_EXECUTE-1.SQL_INJECTION-1.SQL_INJECTION_HIBERNATE-1.SQL_INJECTION_VERTX-1.SQL_PREPARED_STATEMENT_GENERATED_FROM_NONCONSTANT_STRING-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
(javax.jdo.PersistenceManager $PM).newQuery($ARG)
(javax.jdo.PersistenceManager $PM).newQuery(..., $ARG)
(javax.jdo.Query $Q).setFilter($ARG)
(javax.jdo.Query $Q).setGrouping($ARG)
org.hibernate.criterion.Restrictions.sqlRestriction($ARG, ...)
(org.hibernate.Session $S).createQuery((String $ARG), ...)
(org.hibernate.Session $S).createSQLQuery($ARG, ...)
(java.sql.Statement $S).executeQuery($ARG, ...)
(java.sql.Statement $S).execute($ARG, ...)
(java.sql.Statement $S).executeUpdate($ARG, ...)
(java.sql.Statement $S).executeLargeUpdate($ARG, ...)
(java.sql.Statement $S).addBatch($ARG, ...)
(java.sql.PreparedStatement $S).executeQuery($ARG, ...)
(java.sql.PreparedStatement $S).execute($ARG, ...)
(java.sql.PreparedStatement $S).executeUpdate($ARG, ...)
(java.sql.PreparedStatement $S).executeLargeUpdate($ARG, ...)
(java.sql.PreparedStatement $S).addBatch($ARG, ...)
(java.sql.Connection $S).prepareCall($ARG, ...)
(java.sql.Connection $S).prepareStatement($ARG, ...)
(java.sql.Connection $S).nativeSQL($ARG, ...)
new org.springframework.jdbc.core.PreparedStatementCreatorFactory($ARG, ...)
(org.springframework.jdbc.core.PreparedStatementCreatorFactory $F).newPreparedStatementCreator($ARG, ...)
(org.springframework.jdbc.core.JdbcOperations $O).batchUpdate($ARG, ...)
(org.springframework.jdbc.core.JdbcOperations $O).execute($ARG, ...)
(org.springframework.jdbc.core.JdbcOperations $O).query($ARG, ...)
(org.springframework.jdbc.core.JdbcOperations $O).queryForList($ARG, ...)
(org.springframework.jdbc.core.JdbcOperations $O).queryForMap($ARG, ...)
(org.springframework.jdbc.core.JdbcOperations $O).queryForObject($ARG, ...)
(org.springframework.jdbc.core.JdbcOperations $O).queryForRowSet($ARG, ...)
(org.springframework.jdbc.core.JdbcOperations $O).queryForInt($ARG, ...)
(org.springframework.jdbc.core.JdbcOperations $O).queryForLong($ARG, ...)
(org.springframework.jdbc.core.JdbcOperations $O).udpate($ARG, ...)
(org.springframework.jdbc.core.JdbcTemplate $O).batchUpdate($ARG, ...)
(org.springframework.jdbc.core.JdbcTemplate $O).execute($ARG, ...)
(org.springframework.jdbc.core.JdbcTemplate $O).query($ARG, ...)
(org.springframework.jdbc.core.JdbcTemplate $O).queryForList($ARG, ...)
(org.springframework.jdbc.core.JdbcTemplate $O).queryForMap($ARG, ...)
(org.springframework.jdbc.core.JdbcTemplate $O).queryForObject($ARG, ...)
(org.springframework.jdbc.core.JdbcTemplate $O).queryForRowSet($ARG, ...)
(org.springframework.jdbc.core.JdbcTemplate $O).queryForInt($ARG, ...)
(org.springframework.jdbc.core.JdbcTemplate $O).queryForLong($ARG, ...)
(org.springframework.jdbc.core.JdbcTemplate $O).update($ARG, ...)
(io.vertx.sqlclient.SqlClient $O).query($ARG, ...)
(io.vertx.sqlclient.SqlClient $O).preparedQuery($ARG, ...)
(io.vertx.sqlclient.SqlConnection $O).prepare($ARG, ...)
(org.apache.turbine.om.peer.BasePeer $O).executeQuery($ARG, ...)
(org.apache.torque.util.BasePeer $O).executeQuery($ARG, ...)
(javax.persistence.EntityManager $O).createQuery($ARG, ...)
(javax.persistence.EntityManager $O).createNativeQuery($ARG, ...)
```

Good:

```java
final String $ARG = ...;
...
class $CLAZZ {
  ...
  final String $ARG = ...;
  ...
}
(javax.jdo.PersistenceManager $PM).newQuery("...")
(javax.jdo.PersistenceManager $PM).newQuery(..., "...")
(javax.jdo.Query $Q).setFilter("...")
(javax.jdo.Query $Q).setGrouping("...")
org.hibernate.criterion.Restrictions.sqlRestriction("...", ...)
(org.hibernate.Session $S).createQuery("...", ...)
(org.hibernate.Session $S).createSQLQuery("...", ...)
(java.sql.Statement $S).createSQLQuery("...", ...)
(java.sql.Statement $S).execute("...", ...)
(java.sql.Statement $S).executeUpdate("...", ...)
(java.sql.Statement $S).executeLargeUpdate("...", ...)
(java.sql.Statement $S).addBatch("...", ...)
(java.sql.PreparedStatement $S).executeQuery("...", ...)
(java.sql.PreparedStatement $S).execute("...", ...)
(java.sql.PreparedStatement $S).executeUpdate("...", ...)
(java.sql.PreparedStatement $S).executeLargeUpdate("...", ...)
(java.sql.PreparedStatement $S).addBatch("...", ...)
(java.sql.Connection $S).prepareCall("...", ...)
(java.sql.Connection $S).prepareStatement("...", ...)
(java.sql.Connection $S).nativeSQL("...", ...)
new org.springframework.jdbc.core.PreparedStatementCreatorFactory("...", ...)
(org.springframework.jdbc.core.PreparedStatementCreatorFactory $F).newPreparedStatementCreator("...", ...)
(org.springframework.jdbc.core.JdbcOperations $O).batchUpdate("...", ...)
(org.springframework.jdbc.core.JdbcOperations $O).execute("...", ...)
(org.springframework.jdbc.core.JdbcOperations $O).query("...", ...)
(org.springframework.jdbc.core.JdbcOperations $O).queryForList("...", ...)
(org.springframework.jdbc.core.JdbcOperations $O).queryForMap("...", ...)
(org.springframework.jdbc.core.JdbcOperations $O).queryForObject("...", ...)
(org.springframework.jdbc.core.JdbcOperations $O).queryForRowSet("...", ...)
(org.springframework.jdbc.core.JdbcOperations $O).queryForInt("...", ...)
(org.springframework.jdbc.core.JdbcOperations $O).queryForLong("...", ...)
(org.springframework.jdbc.core.JdbcOperations $O).udpate("...", ...)
(org.springframework.jdbc.core.JdbcTemplate $O).batchUpdate("...", ...)
(org.springframework.jdbc.core.JdbcTemplate $O).execute("...", ...)
(org.springframework.jdbc.core.JdbcTemplate $O).query("...", ...)
(org.springframework.jdbc.core.JdbcTemplate $O).queryForList("...", ...)
(org.springframework.jdbc.core.JdbcTemplate $O).queryForMap("...", ...)
(org.springframework.jdbc.core.JdbcTemplate $O).queryForObject("...", ...)
(org.springframework.jdbc.core.JdbcTemplate $O).queryForRowSet("...", ...)
(org.springframework.jdbc.core.JdbcTemplate $O).queryForInt("...", ...)
(org.springframework.jdbc.core.JdbcTemplate $O).queryForLong("...", ...)
(org.springframework.jdbc.core.JdbcTemplate $O).update("...", ...)
(io.vertx.sqlclient.SqlClient $O).query("...", ...)
(io.vertx.sqlclient.SqlClient $O).preparedQuery("...", ...)
(io.vertx.sqlclient.SqlConnection $O).prepare("...", ...)
(org.apache.turbine.om.peer.BasePeer $O).executeQuery("...", ...)
(org.apache.torque.util.BasePeer $O).executeQuery("...", ...)
(javax.persistence.EntityManager $O).createQuery("...", ...)
(javax.persistence.EntityManager $O).createNativeQuery("...", ...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.SQL_INJECTION_SPRING_JDBC-1.SQL_INJECTION_JPA-1.SQL_INJECTION_JDO-1.SQL_INJECTION_JDBC-1.SQL_NONCONSTANT_STRING_PASSED_TO_EXECUTE-1.SQL_INJECTION-1.SQL_INJECTION_HIBERNATE-1.SQL_INJECTION_VERTX-1.SQL_PREPARED_STATEMENT_GENERATED_FROM_NONCONSTANT_STRING-1` (metavariables start with `$`):

- `final String $ARG = ...;
...`
- `class $CLAZZ {
  ...
  final String $ARG = ...;
  ...
}`
- `(javax.jdo.PersistenceManager $PM).newQuery($ARG)`
- `(javax.jdo.PersistenceManager $PM).newQuery("...")`
- `(javax.jdo.PersistenceManager $PM).newQuery(..., $ARG)`
- `(javax.jdo.PersistenceManager $PM).newQuery(..., "...")`
- `(javax.jdo.Query $Q).setFilter($ARG)`
- `(javax.jdo.Query $Q).setFilter("...")`
- `(javax.jdo.Query $Q).setGrouping($ARG)`
- `(javax.jdo.Query $Q).setGrouping("...")`
- `org.hibernate.criterion.Restrictions.sqlRestriction($ARG, ...)`
- `org.hibernate.criterion.Restrictions.sqlRestriction("...", ...)`
- `(org.hibernate.Session $S).createQuery((String $ARG), ...)`
- `(org.hibernate.Session $S).createQuery("...", ...)`
- `(org.hibernate.Session $S).createSQLQuery($ARG, ...)`
- `(org.hibernate.Session $S).createSQLQuery("...", ...)`
- `(java.sql.Statement $S).executeQuery($ARG, ...)`
- `(java.sql.Statement $S).createSQLQuery("...", ...)`
- `(java.sql.Statement $S).execute($ARG, ...)`
- `(java.sql.Statement $S).execute("...", ...)`
- `(java.sql.Statement $S).executeUpdate($ARG, ...)`
- `(java.sql.Statement $S).executeUpdate("...", ...)`
- `(java.sql.Statement $S).executeLargeUpdate($ARG, ...)`
- `(java.sql.Statement $S).executeLargeUpdate("...", ...)`
- `(java.sql.Statement $S).addBatch($ARG, ...)`
- `(java.sql.Statement $S).addBatch("...", ...)`
- `(java.sql.PreparedStatement $S).executeQuery($ARG, ...)`
- `(java.sql.PreparedStatement $S).executeQuery("...", ...)`
- `(java.sql.PreparedStatement $S).execute($ARG, ...)`
- `(java.sql.PreparedStatement $S).execute("...", ...)`
- `(java.sql.PreparedStatement $S).executeUpdate($ARG, ...)`
- `(java.sql.PreparedStatement $S).executeUpdate("...", ...)`
- `(java.sql.PreparedStatement $S).executeLargeUpdate($ARG, ...)`
- `(java.sql.PreparedStatement $S).executeLargeUpdate("...", ...)`
- `(java.sql.PreparedStatement $S).addBatch($ARG, ...)`
- `(java.sql.PreparedStatement $S).addBatch("...", ...)`
- `(java.sql.Connection $S).prepareCall($ARG, ...)`
- `(java.sql.Connection $S).prepareCall("...", ...)`
- `(java.sql.Connection $S).prepareStatement($ARG, ...)`
- `(java.sql.Connection $S).prepareStatement("...", ...)`
- `(java.sql.Connection $S).nativeSQL($ARG, ...)`
- `(java.sql.Connection $S).nativeSQL("...", ...)`
- `new org.springframework.jdbc.core.PreparedStatementCreatorFactory($ARG, ...)`
- `new org.springframework.jdbc.core.PreparedStatementCreatorFactory("...", ...)`
- `(org.springframework.jdbc.core.PreparedStatementCreatorFactory $F).newPreparedStatementCreator($ARG, ...)`
- `(org.springframework.jdbc.core.PreparedStatementCreatorFactory $F).newPreparedStatementCreator("...", ...)`
- `(org.springframework.jdbc.core.JdbcOperations $O).batchUpdate($ARG, ...)`
- `(org.springframework.jdbc.core.JdbcOperations $O).batchUpdate("...", ...)`
- `(org.springframework.jdbc.core.JdbcOperations $O).execute($ARG, ...)`
- `(org.springframework.jdbc.core.JdbcOperations $O).execute("...", ...)`
- `(org.springframework.jdbc.core.JdbcOperations $O).query($ARG, ...)`
- `(org.springframework.jdbc.core.JdbcOperations $O).query("...", ...)`
- `(org.springframework.jdbc.core.JdbcOperations $O).queryForList($ARG, ...)`
- `(org.springframework.jdbc.core.JdbcOperations $O).queryForList("...", ...)`
- `(org.springframework.jdbc.core.JdbcOperations $O).queryForMap($ARG, ...)`
- `(org.springframework.jdbc.core.JdbcOperations $O).queryForMap("...", ...)`
- `(org.springframework.jdbc.core.JdbcOperations $O).queryForObject($ARG, ...)`
- `(org.springframework.jdbc.core.JdbcOperations $O).queryForObject("...", ...)`
- `(org.springframework.jdbc.core.JdbcOperations $O).queryForRowSet($ARG, ...)`
- `(org.springframework.jdbc.core.JdbcOperations $O).queryForRowSet("...", ...)`
- `(org.springframework.jdbc.core.JdbcOperations $O).queryForInt($ARG, ...)`
- `(org.springframework.jdbc.core.JdbcOperations $O).queryForInt("...", ...)`
- `(org.springframework.jdbc.core.JdbcOperations $O).queryForLong($ARG, ...)`
- `(org.springframework.jdbc.core.JdbcOperations $O).queryForLong("...", ...)`
- `(org.springframework.jdbc.core.JdbcOperations $O).udpate($ARG, ...)`
- `(org.springframework.jdbc.core.JdbcOperations $O).udpate("...", ...)`
- `(org.springframework.jdbc.core.JdbcTemplate $O).batchUpdate($ARG, ...)`
- `(org.springframework.jdbc.core.JdbcTemplate $O).batchUpdate("...", ...)`
- `(org.springframework.jdbc.core.JdbcTemplate $O).execute($ARG, ...)`
- `(org.springframework.jdbc.core.JdbcTemplate $O).execute("...", ...)`
- `(org.springframework.jdbc.core.JdbcTemplate $O).query($ARG, ...)`
- `(org.springframework.jdbc.core.JdbcTemplate $O).query("...", ...)`
- `(org.springframework.jdbc.core.JdbcTemplate $O).queryForList($ARG, ...)`
- `(org.springframework.jdbc.core.JdbcTemplate $O).queryForList("...", ...)`
- `(org.springframework.jdbc.core.JdbcTemplate $O).queryForMap($ARG, ...)`
- `(org.springframework.jdbc.core.JdbcTemplate $O).queryForMap("...", ...)`
- `(org.springframework.jdbc.core.JdbcTemplate $O).queryForObject($ARG, ...)`
- `(org.springframework.jdbc.core.JdbcTemplate $O).queryForObject("...", ...)`
- `(org.springframework.jdbc.core.JdbcTemplate $O).queryForRowSet($ARG, ...)`
- `(org.springframework.jdbc.core.JdbcTemplate $O).queryForRowSet("...", ...)`
- `(org.springframework.jdbc.core.JdbcTemplate $O).queryForInt($ARG, ...)`
- `(org.springframework.jdbc.core.JdbcTemplate $O).queryForInt("...", ...)`
- `(org.springframework.jdbc.core.JdbcTemplate $O).queryForLong($ARG, ...)`
- `(org.springframework.jdbc.core.JdbcTemplate $O).queryForLong("...", ...)`
- `(org.springframework.jdbc.core.JdbcTemplate $O).update($ARG, ...)`
- `(org.springframework.jdbc.core.JdbcTemplate $O).update("...", ...)`
- `(io.vertx.sqlclient.SqlClient $O).query($ARG, ...)`
- `(io.vertx.sqlclient.SqlClient $O).query("...", ...)`
- `(io.vertx.sqlclient.SqlClient $O).preparedQuery($ARG, ...)`
- `(io.vertx.sqlclient.SqlClient $O).preparedQuery("...", ...)`
- `(io.vertx.sqlclient.SqlConnection $O).prepare($ARG, ...)`
- `(io.vertx.sqlclient.SqlConnection $O).prepare("...", ...)`
- `(org.apache.turbine.om.peer.BasePeer $O).executeQuery($ARG, ...)`
- `(org.apache.turbine.om.peer.BasePeer $O).executeQuery("...", ...)`
- `(org.apache.torque.util.BasePeer $O).executeQuery($ARG, ...)`
- `(org.apache.torque.util.BasePeer $O).executeQuery("...", ...)`
- `(javax.persistence.EntityManager $O).createQuery($ARG, ...)`
- `(javax.persistence.EntityManager $O).createQuery("...", ...)`
- `(javax.persistence.EntityManager $O).createNativeQuery($ARG, ...)`
- `(javax.persistence.EntityManager $O).createNativeQuery("...", ...)`
