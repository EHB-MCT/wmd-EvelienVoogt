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

module.exports = { startSession };