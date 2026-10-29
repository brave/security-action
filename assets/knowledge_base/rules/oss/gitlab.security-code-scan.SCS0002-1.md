---
name: oss/gitlab.security-code-scan.SCS0002-1
rubric: safety
severity: should_fix
languages: [csharp]
---

**Rule.** SQL Injection is a critical vulnerability that can lead to data or system compromise. By dynamically generating SQL query strings, user input may be able to influence the logic of the SQL statement. This could lead to an adversary accessing information they should not have access to, or in some circumstances, being able to execute OS functionality or code. Replace all dynamically generated SQL queries with parameterized queries. In situations where dynamic queries must be created, never use direct user input, but instead use a map or dictionary of valid values and resolve them using a user supplied key. For example, some database drivers do not allow parameterized queries for `>` or `<` comparison operators. In these cases, do not use a user supplied `>` or `<` value, but rather have the user supply a `gt` or `lt` value. The alphabetical values are then used to look up the `>` and `<` values to be used in the construction of the dynamic query. The same goes for other queries where column or table names are required but cannot be parameterized. Example using parameterized queries with `SqlCommand`: ``` string userInput = "someUserInput"; string connectionString = ...; using (SqlConnection connection = new SqlConnection(connectionString)) { connection.Open(); String sql = "SELECT name, value FROM table where name=@Name"; using (SqlCommand command = new SqlCommand(sql, connection)) { command.Parameters.Add("@Name", System.Data.SqlDbType.NVarChar); command.Parameters["@Name"].Value = userInput; using (SqlDataReader reader = command.ExecuteReader()) { while (reader.Read()) { Console.WriteLine("{0} {1}", reader.GetString(0), reader.GetString(1)); } } } } ``` For more information on SQL Injection see OWASP: https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html

**Why.** Reported as CWE-89. Ported from opengrep rule `gitlab.security_code_scan.SCS0002-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
$DB.$FUNC($ARG, ...);
(DataContext $CTX).$FUNC($ARG, ...)
new $IMPL($ARG, ...);
($IMPL $CMD).CommandText = <...$ARG...>;
MySqlHelper.$FUNC("...", $ARG, ...);
(Session $SESS).Execute($ARG, ...);
```

Good:

```text
$DB.$FUNC("...", ...);
new $IMPL("...", ...);
($IMPL $CMD).CommandText = "...";
(Session $SESS).Execute("...", ...);
```

## Detection hints

Literal patterns from opengrep rule `gitlab.security_code_scan.SCS0002-1` (metavariables start with `$`):

- `^(SqlQuery|ExecuteSqlCommand|ExecuteSqlCommandAsync|ExecuteSqlRaw|ExecuteSqlRawAsync|FromSqlRaw|FromSql|GetSqlStringCommand|ExecuteDataSet|ExecuteReader|ExecuteNonQuery|ExecuteScalar|CreateSQLQuery)$`
- `$DB.$FUNC($ARG, ...);`
- `$DB.$FUNC("...", ...);`
- `^(ExecuteQuery|ExecuteCommand)$`
- `using System.Data.Linq;
...`
- `(DataContext $CTX).$FUNC($ARG, ...)`
- `^(SqlCommand|OracleCommand|NpgsqlCommand|MySqlCommand|EntityCommand|OdbcCommand|OleDbCommand|SqliteCommand)$`
- `new $IMPL($ARG, ...);`
- `new $IMPL("...", ...);`
- `($IMPL $CMD).CommandText = <...$ARG...>;`
- `($IMPL $CMD).CommandText = "...";`
- `^(ExecuteDataRow|ExecuteDataRowAsync|ExecuteDataset|ExecuteDatasetAsync|ExecuteNonQuery|ExecuteNonQueryAsync|ExecuteReader|ExecuteReaderAsync|ExecuteScalar|ExecuteScalarAsync|UpdateDataSet|UpdateDataSetAsync)$`
- `using MySql.Data.MySqlClient;
...`
- `MySqlHelper.$FUNC("...", $ARG, ...);`
- `using Cassandra;
...`
- `(Session $SESS).Execute($ARG, ...);`
- `(Session $SESS).Execute("...", ...);`
