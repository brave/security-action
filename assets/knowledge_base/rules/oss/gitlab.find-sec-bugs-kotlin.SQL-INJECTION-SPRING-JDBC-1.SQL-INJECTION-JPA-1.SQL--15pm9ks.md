---
name: oss/gitlab.find-sec-bugs-kotlin.SQL-INJECTION-SPRING-JDBC-1.SQL-INJECTION-JPA-1.SQL--15pm9ks
rubric: safety
severity: should_fix
languages: [kotlin]
cwe: [CWE-89]
---

**Rule.** The input values included in SQL queries need to be passed in safely. Bind variables in prepared statements can be used to easily mitigate the risk of SQL injection.

**Why.** Reported as CWE-89. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.SQL_INJECTION_SPRING_JDBC-1.SQL_INJECTION_JPA-1.SQL_INJECTION_JDO-1.SQL_INJECTION_JDBC-1.SQL_NONCONSTANT_STRING_PASSED_TO_EXECUTE-1.SQL_INJECTION-1.SQL_INJECTION_HIBERNATE-1.SQL_INJECTION_VERTX-1.SQL_PREPARED_STATEMENT_GENERATED_FROM_NONCONSTANT_STRING-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// untrusted input (source)
$SRC
// flows to sink without sanitization
($PM: javax.jdo.PersistenceManager).newQuery($ARG)
($PM: javax.jdo.PersistenceManager).newQuery(..., $ARG)
($Q: javax.jdo.Query).setFilter($ARG)
($Q: javax.jdo.Query).setGrouping($ARG)
org.hibernate.criterion.Restrictions.sqlRestriction($ARG, ...)
($S: org.hibernate.Session).createQuery($ARG, ...)
($S: org.hibernate.Session).createSQLQuery($ARG, ...)
($S: java.sql.Statement).executeQuery($ARG, ...)
($S: java.sql.Statement).execute($ARG, ...)
($S: java.sql.Statement).executeUpdate($ARG, ...)
($S: java.sql.Statement).executeLargeUpdate($ARG, ...)
($S: java.sql.Statement).addBatch($ARG, ...)
($S: java.sql.PreparedStatement).executeQuery($ARG, ...)
($S: java.sql.PreparedStatement).execute($ARG, ...)
($S: java.sql.PreparedStatement).executeUpdate($ARG, ...)
($S: java.sql.PreparedStatement).executeLargeUpdate($ARG, ...)
($S: java.sql.PreparedStatement).addBatch($ARG, ...)
($S: java.sql.Connection).prepareCall($ARG, ...)
($S: java.sql.Connection).prepareStatement($ARG, ...)
($S: java.sql.Connection).nativeSQL($ARG, ...)
org.springframework.jdbc.core.PreparedStatementCreatorFactory($ARG, ...)
($F: org.springframework.jdbc.core.PreparedStatementCreatorFactory).newPreparedStatementCreator($ARG, ...)
($O: org.springframework.jdbc.core.JdbcOperations).batchUpdate($ARG, ...)
($O: org.springframework.jdbc.core.JdbcOperations).execute($ARG, ...)
($O: org.springframework.jdbc.core.JdbcOperations).query($ARG, ...)
($O: org.springframework.jdbc.core.JdbcOperations).queryForList($ARG, ...)
($O: org.springframework.jdbc.core.JdbcOperations).queryForMap($ARG, ...)
($O: org.springframework.jdbc.core.JdbcOperations).queryForObject($ARG, ...)
($O: org.springframework.jdbc.core.JdbcOperations).queryForRowSet($ARG, ...)
($O: org.springframework.jdbc.core.JdbcOperations).queryForInt($ARG, ...)
($O: org.springframework.jdbc.core.JdbcOperations).queryForLong($ARG, ...)
($O: org.springframework.jdbc.core.JdbcOperations).update($ARG, ...)
($O: org.springframework.jdbc.core.JdbcTemplate).batchUpdate($ARG, ...)
($O: org.springframework.jdbc.core.JdbcTemplate).execute($ARG, ...)
($O: org.springframework.jdbc.core.JdbcTemplate).query($ARG, ...)
($O: org.springframework.jdbc.core.JdbcTemplate).queryForList($ARG, ...)
($O: org.springframework.jdbc.core.JdbcTemplate).queryForMap($ARG, ...)
($O: org.springframework.jdbc.core.JdbcTemplate).queryForObject($ARG, ...)
($O: org.springframework.jdbc.core.JdbcTemplate).queryForRowSet($ARG, ...)
($O: org.springframework.jdbc.core.JdbcTemplate).queryForInt($ARG, ...)
($O: org.springframework.jdbc.core.JdbcTemplate).queryForLong($ARG, ...)
($O: org.springframework.jdbc.core.JdbcTemplate).update($ARG, ...)
($O: io.vertx.sqlclient.SqlClient).query($ARG, ...)
($O: io.vertx.sqlclient.SqlClient).preparedQuery($ARG, ...)
($O: io.vertx.sqlclient.SqlConnection).prepare($ARG, ...)
($O: org.apache.turbine.om.peer.BasePeer).executeQuery($ARG, ...)
($O: org.apache.torque.util.BasePeer).executeQuery($ARG, ...)
($O: javax.persistence.EntityManager).createQuery($ARG, ...)
($O: javax.persistence.EntityManager).createNativeQuery($ARG, ...)
($H: org.jdbi.v3.core.Handle).createQuery($ARG, ...)
($H: org.jdbi.v3.core.Handle).createScript($ARG, ...)
($H: org.jdbi.v3.core.Handle).createUpdate($ARG, ...)
($H: org.jdbi.v3.core.Handle).execute($ARG, ...)
($H: org.jdbi.v3.core.Handle).prepareBatch($ARG, ...)
($H: org.jdbi.v3.core.Handle).select($ARG, ...)
org.jdbi.v3.core.statement.Script($H, $ARG)
org.jdbi.v3.core.statement.Update($H, $ARG)
org.jdbi.v3.core.statement.PreparedBatch($H, $ARG)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.SQL_INJECTION_SPRING_JDBC-1.SQL_INJECTION_JPA-1.SQL_INJECTION_JDO-1.SQL_INJECTION_JDBC-1.SQL_NONCONSTANT_STRING_PASSED_TO_EXECUTE-1.SQL_INJECTION-1.SQL_INJECTION_HIBERNATE-1.SQL_INJECTION_VERTX-1.SQL_PREPARED_STATEMENT_GENERATED_FROM_NONCONSTANT_STRING-1` (metavariables start with `$`):

- `fun $FUNC(..., $SRC: String, ...) { ... }`
- `$SRC`
- `$SB.append($SRC)`
- `$F(..., $SRC, ...)`
- `String.format`
- `StringBuilder`
- `($PM: javax.jdo.PersistenceManager).newQuery($ARG)`
- `($PM: javax.jdo.PersistenceManager).newQuery(..., $ARG)`
- `($Q: javax.jdo.Query).setFilter($ARG)`
- `($Q: javax.jdo.Query).setGrouping($ARG)`
- `org.hibernate.criterion.Restrictions.sqlRestriction($ARG, ...)`
- `($S: org.hibernate.Session).createQuery($ARG, ...)`
- `($S: org.hibernate.Session).createSQLQuery($ARG, ...)`
- `($S: java.sql.Statement).executeQuery($ARG, ...)`
- `($S: java.sql.Statement).execute($ARG, ...)`
- `($S: java.sql.Statement).executeUpdate($ARG, ...)`
- `($S: java.sql.Statement).executeLargeUpdate($ARG, ...)`
- `($S: java.sql.Statement).addBatch($ARG, ...)`
- `($S: java.sql.PreparedStatement).executeQuery($ARG, ...)`
- `($S: java.sql.PreparedStatement).execute($ARG, ...)`
- `($S: java.sql.PreparedStatement).executeUpdate($ARG, ...)`
- `($S: java.sql.PreparedStatement).executeLargeUpdate($ARG, ...)`
- `($S: java.sql.PreparedStatement).addBatch($ARG, ...)`
- `($S: java.sql.Connection).prepareCall($ARG, ...)`
- `($S: java.sql.Connection).prepareStatement($ARG, ...)`
- `($S: java.sql.Connection).nativeSQL($ARG, ...)`
- `org.springframework.jdbc.core.PreparedStatementCreatorFactory($ARG, ...)`
- `($F: org.springframework.jdbc.core.PreparedStatementCreatorFactory).newPreparedStatementCreator($ARG, ...)`
- `($O: org.springframework.jdbc.core.JdbcOperations).batchUpdate($ARG, ...)`
- `($O: org.springframework.jdbc.core.JdbcOperations).execute($ARG, ...)`
- `($O: org.springframework.jdbc.core.JdbcOperations).query($ARG, ...)`
- `($O: org.springframework.jdbc.core.JdbcOperations).queryForList($ARG, ...)`
- `($O: org.springframework.jdbc.core.JdbcOperations).queryForMap($ARG, ...)`
- `($O: org.springframework.jdbc.core.JdbcOperations).queryForObject($ARG, ...)`
- `($O: org.springframework.jdbc.core.JdbcOperations).queryForRowSet($ARG, ...)`
- `($O: org.springframework.jdbc.core.JdbcOperations).queryForInt($ARG, ...)`
- `($O: org.springframework.jdbc.core.JdbcOperations).queryForLong($ARG, ...)`
- `($O: org.springframework.jdbc.core.JdbcOperations).update($ARG, ...)`
- `($O: org.springframework.jdbc.core.JdbcTemplate).batchUpdate($ARG, ...)`
- `($O: org.springframework.jdbc.core.JdbcTemplate).execute($ARG, ...)`
- `($O: org.springframework.jdbc.core.JdbcTemplate).query($ARG, ...)`
- `($O: org.springframework.jdbc.core.JdbcTemplate).queryForList($ARG, ...)`
- `($O: org.springframework.jdbc.core.JdbcTemplate).queryForMap($ARG, ...)`
- `($O: org.springframework.jdbc.core.JdbcTemplate).queryForObject($ARG, ...)`
- `($O: org.springframework.jdbc.core.JdbcTemplate).queryForRowSet($ARG, ...)`
- `($O: org.springframework.jdbc.core.JdbcTemplate).queryForInt($ARG, ...)`
- `($O: org.springframework.jdbc.core.JdbcTemplate).queryForLong($ARG, ...)`
- `($O: org.springframework.jdbc.core.JdbcTemplate).update($ARG, ...)`
- `($O: io.vertx.sqlclient.SqlClient).query($ARG, ...)`
- `($O: io.vertx.sqlclient.SqlClient).preparedQuery($ARG, ...)`
- `($O: io.vertx.sqlclient.SqlConnection).prepare($ARG, ...)`
- `($O: org.apache.turbine.om.peer.BasePeer).executeQuery($ARG, ...)`
- `($O: org.apache.torque.util.BasePeer).executeQuery($ARG, ...)`
- `($O: javax.persistence.EntityManager).createQuery($ARG, ...)`
- `($O: javax.persistence.EntityManager).createNativeQuery($ARG, ...)`
- `($H: org.jdbi.v3.core.Handle).createQuery($ARG, ...)`
- `($H: org.jdbi.v3.core.Handle).createScript($ARG, ...)`
- `($H: org.jdbi.v3.core.Handle).createUpdate($ARG, ...)`
- `($H: org.jdbi.v3.core.Handle).execute($ARG, ...)`
- `($H: org.jdbi.v3.core.Handle).prepareBatch($ARG, ...)`
- `($H: org.jdbi.v3.core.Handle).select($ARG, ...)`
- `org.jdbi.v3.core.statement.Script($H, $ARG)`
- `org.jdbi.v3.core.statement.Update($H, $ARG)`
- `org.jdbi.v3.core.statement.PreparedBatch($H, $ARG)`
