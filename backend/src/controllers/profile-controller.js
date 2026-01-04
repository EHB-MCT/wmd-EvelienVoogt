const knex = require("../db/knex");
const { buildProfile } = require("../services/profiling-service");

async function getSessionProfilePublic(req, res) {
  const { sessionId } = req.params;

  if (!sessionId || typeof sessionId !== "string") {
    return res.status(400).json({ error: "sessionId is required" });
  }

  try {
    const session = await knex("sessions")
      .where({ session_id: sessionId })
      .first();

    if (!session) {
      return res.status(404).json({ error: "unknown_session" });
    }

    const events = await knex("events")
      .where({ session_id: sessionId })
      .orderBy("created_at", "asc");

    const profile = buildProfile(events);

    return res.json({
      scope: "session",
      session_id: sessionId,
      profile,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal_server_error" });
  }
}

module.exports = { getSessionProfilePublic };
