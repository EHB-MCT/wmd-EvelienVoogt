const knex = require("../db/knex");
const { buildProfile } = require("../services/profiling-service");

async function getSessionEvents(req, res) {
	const { sessionId } = req.params;

	if (!sessionId || typeof sessionId !== "string") {
		return res.status(400).json({ error: "sessionId is required" });
	}

	try {
		const session = await knex("sessions").select("id", "session_id", "user_id", "started_at", "ended_at", "device", "browser", "os", "language", "viewport_w", "viewport_h").where({ session_id: sessionId }).first();

		if (!session) {
			return res.status(404).json({ error: "unknown_session" });
		}

		const events = await knex("events").select("id", "user_id", "session_id", "type", "path", "element", "value", "duration_ms", "metadata", "created_at").where({ session_id: sessionId }).orderBy("created_at", "asc");

		return res.status(200).json({
			session,
			eventCount: events.length,
			events,
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: "internal_server_error" });
	}
}

async function getSessionProfile(req, res) {
	const { sessionId } = req.params;

	if (!sessionId || typeof sessionId !== "string") {
		return res.status(400).json({ error: "sessionId is required" });
	}

	try {
		const session = await knex("sessions").select("session_id", "user_id", "started_at", "ended_at").where({ session_id: sessionId }).first();

		if (!session) {
			return res.status(404).json({ error: "unknown_session" });
		}

		const events = await knex("events").select("type", "path", "element", "value", "duration_ms", "metadata", "created_at").where({ session_id: sessionId }).orderBy("created_at", "asc");

		const profile = buildProfile(events);

		return res.status(200).json({
			session,
			eventCount: events.length,
			profile,
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: "internal_server_error" });
	}
}

async function listSessions(req, res) {
	const limit = Math.min(parseInt(req.query.limit ?? "50", 10) || 50, 200);

	try {
		const rows = await knex("sessions as s")
			.leftJoin("events as e", "e.session_id", "s.session_id")
			.select("s.id", "s.session_id", "s.user_id", "s.started_at", "s.ended_at", "s.device", "s.browser", "s.os", "s.language", "s.viewport_w", "s.viewport_h")
			.count({ event_count: "e.id" })
			.groupBy("s.id", "s.session_id", "s.user_id", "s.started_at", "s.ended_at", "s.device", "s.browser", "s.os", "s.language", "s.viewport_w", "s.viewport_h")
			.orderBy("s.started_at", "desc")
			.limit(limit);

		const sessions = rows.map((r) => ({
			...r,
			event_count: Number(r.event_count ?? 0),
		}));

		return res.status(200).json({
			scope: "session",
			count: sessions.length,
			sessions,
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: "internal_server_error" });
	}
}

module.exports = {
	getSessionEvents,
	getSessionProfile,
	listSessions,
};
