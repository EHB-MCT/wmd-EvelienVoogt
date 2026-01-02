const knex = require("../db/knex");

async function postEvent(req, res) {
	const { session_id, type, path, element, value, duration_ms, metadata } = req.body ?? {};

	if (!session_id || typeof session_id !== "string") {
		return res.status(400).json({ error: "session_id is required (string)" });
	}

	if (!type || typeof type !== "string") {
		return res.status(400).json({ error: "type is required (string)" });
	}

	if (!path || typeof path !== "string") {
		return res.status(400).json({ error: "path is required (string)" });
	}

	if (metadata !== undefined && (typeof metadata !== "object" || Array.isArray(metadata) || metadata === null)) {
		return res.status(400).json({ error: "metadata must be an object (json)" });
	}

	const cleanType = type.trim().toLowerCase();
	const cleanPath = path.trim();
	const cleanSessionId = session_id.trim();

	const session = await knex("sessions").select("session_id").where({ session_id: cleanSessionId }).first();

	if (!session) {
		return res.status(404).json({ error: "Unknown session_id" });
	}

	let cleanDuration = null;

	if (duration_ms !== undefined && duration_ms !== null && duration_ms !== "") {
		const n = Number(duration_ms);

		if (!Number.isFinite(n)) {
			return res.status(400).json({ error: "duration_ms must be a number" });
		}

		cleanDuration = Math.max(0, Math.trunc(n));
	}

	try {
		const [event] = await knex("events")
			.insert({
				session_id: cleanSessionId,
				type: cleanType,
				path: cleanPath,
				element: element ?? null,
				value: value ?? null,
				duration_ms: cleanDuration,
				metadata: metadata ?? null,
			})
			.returning(["id", "user_id", "session_id", "type", "path", "element", "value", "duration_ms", "metadata", "created_at"]);

		return res.status(201).json({ event });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: "internal_server_error" });
	}
}

module.exports = { postEvent };
