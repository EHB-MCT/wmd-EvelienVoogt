exports.up = function (knex) {
  return knex.schema.alterTable("users", (t) => {
    t.string("username").unique();
    t.string("first_name");
    t.string("last_name");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("users", (t) => {
    t.dropColumn("username");
    t.dropColumn("first_name");
    t.dropColumn("last_name");
  });
};