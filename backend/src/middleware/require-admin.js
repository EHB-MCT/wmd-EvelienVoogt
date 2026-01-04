const knex = require("../db/knex");

module.exports = async function requireAdmin(req, res, next) {
	// optional-auth should have already populated req.user from the token
	const userPayload = req.user;
	if (!userPayload || !userPayload.user_id) {
		return res.status(401).json({ error: "unauthorized" });
	}

	try {
		const user = await knex("users").select("id", "is_admin").where({ id: userPayload.user_id }).first();

		if (!user || !user.is_admin) {
			return res.status(403).json({ error: "forbidden" });
		}

		// attach the full user record for downstream handlers if needed
		req.userRecord = user;
		next();
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: "internal_server_error" });
	}
};
