---
name: oss/gitlab.find-sec-bugs-scala.SQL-INJECTION-SPRING-JDBC-1.SQL-INJECTION-JPA-1.SQL-I-18brqfz
rubric: safety
severity: should_fix
languages: [scala]
---

**Rule.** The input values included in SQL queries need to be passed in safely. Bind variables in prepared statements can be used to easily mitigate the risk of SQL injection.

**Why.** Reported as CWE-89. Ported from opengrep rule `gitlab.find_sec_bugs_scala.SQL_INJECTION_SPRING_JDBC-1.SQL_INJECTION_JPA-1.SQL_INJECTION_JDO-1.SQL_INJECTION_JDBC-1.SQL_NONCONSTANT_STRING_PASSED_TO_EXECUTE-1.SCALA_SQL_INJECTION_SLICK-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
($PM:javax.jdo.PersistenceManager).newQuery(<...$ARG...>)
($PM:javax.jdo.PersistenceManager).newQuery(..., <...$ARG...>)
($Q: javax.jdo.Query).setFilter(<...$ARG...>)
($Q: javax.jdo.Query).setGrouping(<...$ARG...>)
($H: org.hibernate.criterion.Restrictions).sqlRestriction(<...$ARG...>, ...)
($S: org.hibernate.Session).createQuery(<...$ARG...>, ...)
($S: org.hibernate.Session).createSQLQuery(<...$ARG...>, ...)
($S: java.sql.Statement).executeQuery(<...$ARG...>, ...)
($S: java.sql.Statement).execute(<...$ARG...>, ...)
($S: java.sql.Statement).executeUpdate(<...$ARG...>, ...)
($S: java.sql.Statement).executeLargeUpdate(<...$ARG...>, ...)
($S: java.sql.Statement).addBatch(<...$ARG...>, ...)
($S: java.sql.PreparedStatement).executeQuery(<...$ARG...>, ...)
($S: java.sql.PreparedStatement).execute(<...$ARG...>, ...)
($S: java.sql.PreparedStatement).executeUpdate(<...$ARG...>, ...)
($S: java.sql.PreparedStatement).executeLargeUpdate(<...$ARG...>, ...)
($S: java.sql.PreparedStatement).addBatch(<...$ARG...>, ...)
($S: java.sql.Connection).prepareCall(<...$ARG...>, ...)
($S: java.sql.Connection).prepareStatement(<...$ARG...>, ...)
($S: java.sql.Connection).nativeSQL(<...$ARG...>, ...)
new org.springframework.jdbc.core.PreparedStatementCreatorFactory(<...$ARG...>, ...)
(org.springframework.jdbc.core.PreparedStatementCreatorFactory $F).newPreparedStatementCreator(<...$ARG...>, ...)
($O: org.springframework.jdbc.core.JdbcOperations).batchUpdate(<...$ARG...>, ...)
($O: org.springframework.jdbc.core.JdbcOperations).execute(<...$ARG...>, ...)
($O: org.springframework.jdbc.core.JdbcOperations).query(<...$ARG...>, ...)
($O: org.springframework.jdbc.core.JdbcOperations).queryForList(<...$ARG...>, ...)
($O: org.springframework.jdbc.core.JdbcOperations).queryForMap(<...$ARG...>, ...)
($O: org.springframework.jdbc.core.JdbcOperations).queryForObject(<...$ARG...>, ...)
($O: org.springframework.jdbc.core.JdbcOperations).queryForRowSet(<...$ARG...>, ...)
($O: org.springframework.jdbc.core.JdbcOperations).queryForInt(<...$ARG...>, ...)
($O: org.springframework.jdbc.core.JdbcOperations).queryForLong(<...$ARG...>, ...)
($O: org.springframework.jdbc.core.JdbcOperations).update(<...$ARG...>, ...)
($O: org.springframework.jdbc.core.JdbcTemplate).batchUpdate(<...$ARG...>, ...)
($O: org.springframework.jdbc.core.JdbcTemplate).execute(<...$ARG...>, ...)
($O: org.springframework.jdbc.core.JdbcTemplate).query(<...$ARG...>, ...)
($O: org.springframework.jdbc.core.JdbcTemplate).queryForList(<...$ARG...>, ...)
($O: org.springframework.jdbc.core.JdbcTemplate).queryForMap(<...$ARG...>, ...)
($O: org.springframework.jdbc.core.JdbcTemplate).queryForObject(<...$ARG...>, ...)
($O: org.springframework.jdbc.core.JdbcTemplate).queryForRowSet(<...$ARG...>, ...)
($O: org.springframework.jdbc.core.JdbcTemplate).queryForInt(<...$ARG...>, ...)
($O: org.springframework.jdbc.core.JdbcTemplate).queryForLong(<...$ARG...>, ...)
($O: org.springframework.jdbc.core.JdbcTemplate).update(<...$ARG...>, ...)
($O: io.vertx.sqlclient.SqlClient).query(<...$ARG...>, ...)
($O: io.vertx.sqlclient.SqlClient).preparedQuery(<...$ARG...>, ...)
($O: io.vertx.sqlclient.SqlConnection).prepare(<...$ARG...>, ...)
($O: org.apache.turbine.om.peer.BasePeer).executeQuery(<...$ARG...>, ...)
($O: org.apache.torque.util.BasePeer).executeQuery(<...$ARG...>, ...)
($O: javax.persistence.EntityManager).createQuery(<...$ARG...>, ...)
($O: javax.persistence.EntityManager).createNativeQuery(<...$ARG...>, ...)
anorm.SQL(<...$ARG...>)
SQL(<...$ARG...>)
```

Good:

```text
$ARG = ...
...
object $CLAZZ {
  ...
  $ARG = ...
  ...
}
class $CLAZZ {
  ...
  $ARG = ...
  ...
}
($PM:javax.jdo.PersistenceManager).newQuery("...")
($PM:javax.jdo.PersistenceManager).newQuery(..., "...")
($Q: javax.jdo.Query).setFilter("...")
($Q: javax.jdo.Query).setGrouping("...")
($H: org.hibernate.criterion.Restrictions).sqlRestriction("...", ...)
($S: org.hibernate.Session).createQuery("...", ...)
($S: org.hibernate.Session).createSQLQuery("...", ...)
($S: java.sql.Statement).createSQLQuery("...", ...)
($S: java.sql.Statement).execute("...", ...)
($S: java.sql.Statement).executeUpdate("...", ...)
($S: java.sql.Statement).executeLargeUpdate("...", ...)
($S: java.sql.Statement).addBatch("...", ...)
($S: java.sql.PreparedStatement).executeQuery("...", ...)
($S: java.sql.PreparedStatement).execute("...", ...)
($S: java.sql.PreparedStatement).executeUpdate("...", ...)
($S: java.sql.PreparedStatement).executeLargeUpdate("...", ...)
($S: java.sql.PreparedStatement).addBatch("...", ...)
($S: java.sql.Connection).prepareCall("...", ...)
($S: java.sql.Connection).prepareStatement("...", ...)
($S: java.sql.Connection).nativeSQL("...", ...)
new org.springframework.jdbc.core.PreparedStatementCreatorFactory("...", ...)
(org.springframework.jdbc.core.PreparedStatementCreatorFactory $F).newPreparedStatementCreator("...", ...)
($O: org.springframework.jdbc.core.JdbcOperations).batchUpdate("...", ...)
($O: org.springframework.jdbc.core.JdbcOperations).execute("...", ...)
($O: org.springframework.jdbc.core.JdbcOperations).query("...", ...)
($O: org.springframework.jdbc.core.JdbcOperations).queryForList("...", ...)
($O: org.springframework.jdbc.core.JdbcOperations).queryForMap("...", ...)
($O: org.springframework.jdbc.core.JdbcOperations).queryForObject("...", ...)
($O: org.springframework.jdbc.core.JdbcOperations).queryForRowSet("...", ...)
($O: org.springframework.jdbc.core.JdbcOperations).queryForInt("...", ...)
($O: org.springframework.jdbc.core.JdbcOperations).queryForLong("...", ...)
($O: org.springframework.jdbc.core.JdbcOperations).update("...", ...)
($O: org.springframework.jdbc.core.JdbcTemplate).batchUpdate("...", ...)
($O: org.springframework.jdbc.core.JdbcTemplate).execute("...", ...)
($O: org.springframework.jdbc.core.JdbcTemplate).query("...", ...)
($O: org.springframework.jdbc.core.JdbcTemplate).queryForList("...", ...)
($O: org.springframework.jdbc.core.JdbcTemplate).queryForMap("...", ...)
($O: org.springframework.jdbc.core.JdbcTemplate).queryForObject("...", ...)
($O: org.springframework.jdbc.core.JdbcTemplate).queryForRowSet("...", ...)
($O: org.springframework.jdbc.core.JdbcTemplate).queryForInt("...", ...)
($O: org.springframework.jdbc.core.JdbcTemplate).queryForLong("...", ...)
($O: org.springframework.jdbc.core.JdbcTemplate).update("...", ...)
($O: io.vertx.sqlclient.SqlClient).query("...", ...)
($O: io.vertx.sqlclient.SqlClient).preparedQuery("...", ...)
($O: io.vertx.sqlclient.SqlConnection).prepare("...", ...)
($O: org.apache.turbine.om.peer.BasePeer).executeQuery("...", ...)
($O: org.apache.torque.util.BasePeer).executeQuery("...", ...)
($O: javax.persistence.EntityManager).createQuery("...", ...)
($O: javax.persistence.EntityManager).createNativeQuery("...", ...)
anorm.SQL("...")
SQL("...")
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.SQL_INJECTION_SPRING_JDBC-1.SQL_INJECTION_JPA-1.SQL_INJECTION_JDO-1.SQL_INJECTION_JDBC-1.SQL_NONCONSTANT_STRING_PASSED_TO_EXECUTE-1.SCALA_SQL_INJECTION_SLICK-1` (metavariables start with `$`):

- `$ARG = ...
...`
- `object $CLAZZ {
  ...
  $ARG = ...
  ...
}`
- `class $CLAZZ {
  ...
  $ARG = ...
  ...
}`
- `($PM:javax.jdo.PersistenceManager).newQuery(<...$ARG...>)`
- `($PM:javax.jdo.PersistenceManager).newQuery("...")`
- `($PM:javax.jdo.PersistenceManager).newQuery(..., <...$ARG...>)`
- `($PM:javax.jdo.PersistenceManager).newQuery(..., "...")`
- `($Q: javax.jdo.Query).setFilter(<...$ARG...>)`
- `($Q: javax.jdo.Query).setFilter("...")`
- `($Q: javax.jdo.Query).setGrouping(<...$ARG...>)`
- `($Q: javax.jdo.Query).setGrouping("...")`
- `($H: org.hibernate.criterion.Restrictions).sqlRestriction(<...$ARG...>, ...)`
- `($H: org.hibernate.criterion.Restrictions).sqlRestriction("...", ...)`
- `($S: org.hibernate.Session).createQuery(<...$ARG...>, ...)`
- `($S: org.hibernate.Session).createQuery("...", ...)`
- `($S: org.hibernate.Session).createSQLQuery(<...$ARG...>, ...)`
- `($S: org.hibernate.Session).createSQLQuery("...", ...)`
- `($S: java.sql.Statement).executeQuery(<...$ARG...>, ...)`
- `($S: java.sql.Statement).createSQLQuery("...", ...)`
- `($S: java.sql.Statement).execute(<...$ARG...>, ...)`
- `($S: java.sql.Statement).execute("...", ...)`
- `($S: java.sql.Statement).executeUpdate(<...$ARG...>, ...)`
- `($S: java.sql.Statement).executeUpdate("...", ...)`
- `($S: java.sql.Statement).executeLargeUpdate(<...$ARG...>, ...)`
- `($S: java.sql.Statement).executeLargeUpdate("...", ...)`
- `($S: java.sql.Statement).addBatch(<...$ARG...>, ...)`
- `($S: java.sql.Statement).addBatch("...", ...)`
- `($S: java.sql.PreparedStatement).executeQuery(<...$ARG...>, ...)`
- `($S: java.sql.PreparedStatement).executeQuery("...", ...)`
- `($S: java.sql.PreparedStatement).execute(<...$ARG...>, ...)`
- `($S: java.sql.PreparedStatement).execute("...", ...)`
- `($S: java.sql.PreparedStatement).executeUpdate(<...$ARG...>, ...)`
- `($S: java.sql.PreparedStatement).executeUpdate("...", ...)`
- `($S: java.sql.PreparedStatement).executeLargeUpdate(<...$ARG...>, ...)`
- `($S: java.sql.PreparedStatement).executeLargeUpdate("...", ...)`
- `($S: java.sql.PreparedStatement).addBatch(<...$ARG...>, ...)`
- `($S: java.sql.PreparedStatement).addBatch("...", ...)`
- `($S: java.sql.Connection).prepareCall(<...$ARG...>, ...)`
- `($S: java.sql.Connection).prepareCall("...", ...)`
- `($S: java.sql.Connection).prepareStatement(<...$ARG...>, ...)`
- `($S: java.sql.Connection).prepareStatement("...", ...)`
- `($S: java.sql.Connection).nativeSQL(<...$ARG...>, ...)`
- `($S: java.sql.Connection).nativeSQL("...", ...)`
- `new org.springframework.jdbc.core.PreparedStatementCreatorFactory(<...$ARG...>, ...)`
- `new org.springframework.jdbc.core.PreparedStatementCreatorFactory("...", ...)`
- `(org.springframework.jdbc.core.PreparedStatementCreatorFactory $F).newPreparedStatementCreator(<...$ARG...>, ...)`
- `(org.springframework.jdbc.core.PreparedStatementCreatorFactory $F).newPreparedStatementCreator("...", ...)`
- `($O: org.springframework.jdbc.core.JdbcOperations).batchUpdate(<...$ARG...>, ...)`
- `($O: org.springframework.jdbc.core.JdbcOperations).batchUpdate("...", ...)`
- `($O: org.springframework.jdbc.core.JdbcOperations).execute(<...$ARG...>, ...)`
- `($O: org.springframework.jdbc.core.JdbcOperations).execute("...", ...)`
- `($O: org.springframework.jdbc.core.JdbcOperations).query(<...$ARG...>, ...)`
- `($O: org.springframework.jdbc.core.JdbcOperations).query("...", ...)`
- `($O: org.springframework.jdbc.core.JdbcOperations).queryForList(<...$ARG...>, ...)`
- `($O: org.springframework.jdbc.core.JdbcOperations).queryForList("...", ...)`
- `($O: org.springframework.jdbc.core.JdbcOperations).queryForMap(<...$ARG...>, ...)`
- `($O: org.springframework.jdbc.core.JdbcOperations).queryForMap("...", ...)`
- `($O: org.springframework.jdbc.core.JdbcOperations).queryForObject(<...$ARG...>, ...)`
- `($O: org.springframework.jdbc.core.JdbcOperations).queryForObject("...", ...)`
- `($O: org.springframework.jdbc.core.JdbcOperations).queryForRowSet(<...$ARG...>, ...)`
- `($O: org.springframework.jdbc.core.JdbcOperations).queryForRowSet("...", ...)`
- `($O: org.springframework.jdbc.core.JdbcOperations).queryForInt(<...$ARG...>, ...)`
- `($O: org.springframework.jdbc.core.JdbcOperations).queryForInt("...", ...)`
- `($O: org.springframework.jdbc.core.JdbcOperations).queryForLong(<...$ARG...>, ...)`
- `($O: org.springframework.jdbc.core.JdbcOperations).queryForLong("...", ...)`
- `($O: org.springframework.jdbc.core.JdbcOperations).update(<...$ARG...>, ...)`
- `($O: org.springframework.jdbc.core.JdbcOperations).update("...", ...)`
- `($O: org.springframework.jdbc.core.JdbcTemplate).batchUpdate(<...$ARG...>, ...)`
- `($O: org.springframework.jdbc.core.JdbcTemplate).batchUpdate("...", ...)`
- `($O: org.springframework.jdbc.core.JdbcTemplate).execute(<...$ARG...>, ...)`
- `($O: org.springframework.jdbc.core.JdbcTemplate).execute("...", ...)`
- `($O: org.springframework.jdbc.core.JdbcTemplate).query(<...$ARG...>, ...)`
- `($O: org.springframework.jdbc.core.JdbcTemplate).query("...", ...)`
- `($O: org.springframework.jdbc.core.JdbcTemplate).queryForList(<...$ARG...>, ...)`
- `($O: org.springframework.jdbc.core.JdbcTemplate).queryForList("...", ...)`
- `($O: org.springframework.jdbc.core.JdbcTemplate).queryForMap(<...$ARG...>, ...)`
- `($O: org.springframework.jdbc.core.JdbcTemplate).queryForMap("...", ...)`
- `($O: org.springframework.jdbc.core.JdbcTemplate).queryForObject(<...$ARG...>, ...)`
- `($O: org.springframework.jdbc.core.JdbcTemplate).queryForObject("...", ...)`
- `($O: org.springframework.jdbc.core.JdbcTemplate).queryForRowSet(<...$ARG...>, ...)`
- `($O: org.springframework.jdbc.core.JdbcTemplate).queryForRowSet("...", ...)`
- `($O: org.springframework.jdbc.core.JdbcTemplate).queryForInt(<...$ARG...>, ...)`
- `($O: org.springframework.jdbc.core.JdbcTemplate).queryForInt("...", ...)`
- `($O: org.springframework.jdbc.core.JdbcTemplate).queryForLong(<...$ARG...>, ...)`
- `($O: org.springframework.jdbc.core.JdbcTemplate).queryForLong("...", ...)`
- `($O: org.springframework.jdbc.core.JdbcTemplate).update(<...$ARG...>, ...)`
- `($O: org.springframework.jdbc.core.JdbcTemplate).update("...", ...)`
- `($O: io.vertx.sqlclient.SqlClient).query(<...$ARG...>, ...)`
- `($O: io.vertx.sqlclient.SqlClient).query("...", ...)`
- `($O: io.vertx.sqlclient.SqlClient).preparedQuery(<...$ARG...>, ...)`
- `($O: io.vertx.sqlclient.SqlClient).preparedQuery("...", ...)`
- `($O: io.vertx.sqlclient.SqlConnection).prepare(<...$ARG...>, ...)`
- `($O: io.vertx.sqlclient.SqlConnection).prepare("...", ...)`
- `($O: org.apache.turbine.om.peer.BasePeer).executeQuery(<...$ARG...>, ...)`
- `($O: org.apache.turbine.om.peer.BasePeer).executeQuery("...", ...)`
- `($O: org.apache.torque.util.BasePeer).executeQuery(<...$ARG...>, ...)`
- `($O: org.apache.torque.util.BasePeer).executeQuery("...", ...)`
- `($O: javax.persistence.EntityManager).createQuery(<...$ARG...>, ...)`
- `($O: javax.persistence.EntityManager).createQuery("...", ...)`
- `($O: javax.persistence.EntityManager).createNativeQuery(<...$ARG...>, ...)`
- `($O: javax.persistence.EntityManager).createNativeQuery("...", ...)`
- `anorm.SQL(<...$ARG...>)`
- `anorm.SQL("...")`
- `import anorm._
...`
- `SQL(<...$ARG...>)`
- `SQL("...")`
