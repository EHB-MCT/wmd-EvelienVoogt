exports.up = function (knex) {
  return knex.schema.createTable("events", (t) => {
    t.increments("id").primary();

    t
      .integer("user_id")
      .unsigned()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");

    // Link to sessions via session_id string
    t.string("session_id");

    // Type of event
    t.string("type").notNullable(); // click, hover, page_view, tab_focus, tab_blur, ...

    // where did it happen?
    t.string("path").notNullable(); // /home, /dashboard, ...
    t.string("element");            // #cta, nav-link, input-email, ...

    // Extra details
    t.text("value");                // bv. form value
    t.integer("duration_ms");       // bv. time-away, time-on-page, etc.

    // Flexible extra data: scroll depth, coords, referrer, visibility state...
    t.jsonb("metadata");

    t.timestamp("created_at").notNullable().defaultTo(knex.fn.now());

    // Indexes for faster querying
    t.index(["user_id"]);
    t.index(["session_id"]);
    t.index(["type"]);
    t.index(["path"]);
    t.index(["created_at"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("events");
};
