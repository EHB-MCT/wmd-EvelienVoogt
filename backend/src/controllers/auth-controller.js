const knex = require("../db/knex");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
		const existing = await knex("users").select("id").where({ username: cleanUsername }).orWhere({ email: cleanEmail }).first();

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
	const { username, password } = req.body ?? {};

	if (!username || typeof username !== "string") {
		return res.status(400).json({ error: "username is required (string)" });
	}
	if (!password || typeof password !== "string") {
		return res.status(400).json({ error: "password is required (string)" });
	}

	const cleanUsername = username.trim();

	try {
		const user = await knex("users").select("id", "username", "email", "first_name", "last_name", "password_hash").where({ username: cleanUsername }).first();

		if (!user) {
			return res.status(401).json({ error: "invalid_credentials" });
		}

		const ok = await bcrypt.compare(password, user.password_hash);
		if (!ok) {
			return res.status(401).json({ error: "invalid_credentials" });
		}

		if (!process.env.JWT_SECRET) {
			return res.status(500).json({ error: "JWT_SECRET missing" });
		}

		const token = jwt.sign({ user_id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "7d" });

		return res.status(200).json({
			token,
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
				first_name: user.first_name,
				last_name: user.last_name,
			},
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: "internal_server_error" });
	}
}

module.exports = { register, login };
