# ruleid: activerecord-sanitize-sql-noop
ActiveRecord::Base.sanitize_sql("#{channel}_channel_id")

# ok: activerecord-sanitize-sql-noop
sanitize_sql_for_conditions(["name=? and group_id=?", "foo'bar", 4])
# => "name='foo''bar' and group_id=4"

# ok: activerecord-sanitize-sql-noop
sanitize_sql_for_conditions(["name=:name and group_id=:group_id", name: "foo'bar", group_id: 4])
# => "name='foo''bar' and group_id='4'"

# ok: activerecord-sanitize-sql-noop
sanitize_sql_for_conditions(["name='%s' and group_id='%s'", "foo'bar", 4])
# => "name='foo''bar' and group_id='4'"

# ruleid: activerecord-sanitize-sql-noop
sanitize_sql_for_conditions("#{user_generated}")

# ruleid: activerecord-sanitize-sql-noop
sanitize_sql_for_conditions(some_variable)
# possibly a false-positive in the case that some_variable is the correct kind of hash

# ok: activerecord-sanitize-sql-noop
sanitize_sql_for_order([Arel.sql("field(id, ?)"), [1,3,2]])
# => "field(id, 1,3,2)"

# ruleid: activerecord-sanitize-sql-noop
sanitize_sql_for_order("id ASC")
# => "id ASC"
# Yes, directly from the Rails documentation, and not dangerous as constant, but a no-op so bad

# ruleid: activerecord-sanitize-sql-noop
ActiveRecord::Base.sanitize_sql_for_order("#{order} ASC")
# Like, you're just asking for errors to happen if you aren't whitelisting order anyway.