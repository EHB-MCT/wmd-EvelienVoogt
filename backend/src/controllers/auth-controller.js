const knex = require("../db/knex");
const bcrypt = require("bcryptjs");

async function register(req, res) {
  const { username, email, password, first_name, last_name } = req.body ?? {};

  if (!username || typeof username !== "string") {
    return res.status(400).json({ error: "username is required (string)" });
  }
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "email is required (string)" });
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    return res.status(400).json({ error: "password must be at least 6 chars" });
  }

  const cleanUsername = username.trim();
  const cleanEmail = email.trim().toLowerCase();

  try {
    const existing = await knex("users")
      .select("id")
      .where({ username: cleanUsername })
      .orWhere({ email: cleanEmail })
      .first();

    if (existing) {
      return res.status(409).json({ error: "username or email already exists" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [user] = await knex("users")
      .insert({
        username: cleanUsername,
        email: cleanEmail,
        first_name: first_name ?? null,
        last_name: last_name ?? null,
        password_hash,
      })
      .returning(["id", "username", "email", "first_name", "last_name", "created_at"]);

    return res.status(201).json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal_server_error" });
  }
}

async function login(req, res) {
  return res.status(501).json({ error: "not_implemented" });
}

module.exports = { register, login };
