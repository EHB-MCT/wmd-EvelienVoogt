exports.up = function (knex) {
  return knex.schema.createTable("sessions", (t) => {
    t.increments("id").primary();

    t
      .integer("user_id")
      .unsigned()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");

    t.string("session_id").notNullable().unique();

    t.timestamp("started_at").notNullable().defaultTo(knex.fn.now());
    t.timestamp("ended_at");

    t.string("device");
    t.string("browser");
    t.string("os");
    t.string("language");
    t.integer("viewport_w");
    t.integer("viewport_h");

    t.index(["user_id"]);
    t.index(["started_at"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("sessions");
};
