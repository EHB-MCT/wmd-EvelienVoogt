const knex = require("../db/knex");

async function postEvent(req, res) {
  const { session_id, type, path } = req.body ?? {};

  if (!session_id || typeof session_id !== "string") {
    return res.status(400).json({ error: "session_id is required (string)" });
  }

  if (!type || typeof type !== "string") {
    return res.status(400).json({ error: "type is required (string)" });
  }

  if (!path || typeof path !== "string") {
    return res.status(400).json({ error: "path is required (string)" });
  }

  try {
    const [event] = await knex("events")
      .insert({ session_id, type, path })
      .returning(["id", "session_id", "type", "path", "created_at"]);

    return res.status(201).json({ event });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal_server_error" });
  }
}

module.exports = { postEvent };