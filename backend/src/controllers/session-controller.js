const crypto = require("crypto");
const knex = require("../db/knex");

async function startSession(req, res) {
  const {
    device,
    browser,
    os,
    language,
    viewport_w,
    viewport_h,
  } = req.body ?? {};

const user_id = req.user?.user_id ?? null;

  const session_id = crypto.randomUUID();

  try {
    await knex("sessions").insert({
      session_id,
      user_id: user_id ?? null,
      device: device ?? null,
      browser: browser ?? null,
      os: os ?? null,
      language: language ?? null,
      viewport_w: viewport_w ?? null,
      viewport_h: viewport_h ?? null,
      // started_at → default in DB
    });

    return res.status(201).json({ session_id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal_server_error" });
  }
}

async function attachUserToSession(req, res) {
  const user_id = req.user?.user_id;

  if (!user_id) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const { session_id } = req.body ?? {};
  if (!session_id || typeof session_id !== "string") {
    return res.status(400).json({ error: "session_id is required (string)" });
  }

  const cleanSessionId = session_id.trim();

  try {
    const session = await knex("sessions")
      .select("session_id", "user_id")
      .where({ session_id: cleanSessionId })
      .first();

    if (!session) {
      return res.status(404).json({ error: "Unknown session_id" });
    }

    // Check if session is already attached to a different user
    if (session.user_id && session.user_id !== user_id) {
      return res.status(409).json({ error: "session_already_attached" });
    }

    await knex("sessions")
      .update({ user_id })
      .where({ session_id: cleanSessionId });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal_server_error" });
  }
}

module.exports = { startSession, attachUserToSession };