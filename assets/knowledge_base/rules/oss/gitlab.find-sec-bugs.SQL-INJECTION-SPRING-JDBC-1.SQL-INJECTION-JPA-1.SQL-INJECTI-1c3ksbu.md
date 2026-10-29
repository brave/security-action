---
name: oss/gitlab.find-sec-bugs.SQL-INJECTION-SPRING-JDBC-1.SQL-INJECTION-JPA-1.SQL-INJECTI-1c3ksbu
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** The input values included in SQL queries need to be passed in safely. Bind variables in prepared statements can be used to easily mitigate the risk of SQL injection.

**Why.** Reported as CWE-89: Improper Neutralization of Special Elements used in an SQL Command ('SQL Injection'). Ported from opengrep rule `gitlab.find_sec_bugs.SQL_INJECTION_SPRING_JDBC-1.SQL_INJECTION_JPA-1.SQL_INJECTION_JDO-1.SQL_INJECTION_JDBC-1.SQL_NONCONSTANT_STRING_PASSED_TO_EXECUTE-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
(javax.jdo.PersistenceManager $PM).newQuery($ARG)
(javax.jdo.PersistenceManager $PM).newQuery(..., $ARG)
(javax.jdo.Query $Q).setFilter($ARG)
(javax.jdo.Query $Q).setGrouping($ARG)
(org.hibernate.criterion.Restrictions $H).sqlRestriction($ARG, ...)
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
(org.hibernate.criterion.Restrictions $H).sqlRestriction("...", ...)
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

Literal patterns from opengrep rule `gitlab.find_sec_bugs.SQL_INJECTION_SPRING_JDBC-1.SQL_INJECTION_JPA-1.SQL_INJECTION_JDO-1.SQL_INJECTION_JDBC-1.SQL_NONCONSTANT_STRING_PASSED_TO_EXECUTE-1` (metavariables start with `$`):

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
- `(org.hibernate.criterion.Restrictions $H).sqlRestriction($ARG, ...)`
- `(org.hibernate.criterion.Restrictions $H).sqlRestriction("...", ...)`
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
