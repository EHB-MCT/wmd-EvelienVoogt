exports.seed = async function (knex) {
	// Deletes existing entries to keep seed idempotent
	await knex("events").del();
	await knex("sessions").del();

	// Try to attach to the seeded admin user, if present
	const user = await knex("users").where({ email: "admin@example.com" }).first();

	const sessionId = "session_abc123";
	const now = new Date();

	const session = {
		user_id: user ? user.id : null,
		session_id: sessionId,
		started_at: new Date(now.getTime() - 1000 * 60 * 30), // 30 minutes ago
		ended_at: now,
		device: "desktop",
		browser: "Chrome 121",
		os: "Windows 10",
		language: "en-US",
		viewport_w: 1366,
		viewport_h: 768,
	};

	await knex("sessions").insert(session);

	const events = [
		{
			user_id: user ? user.id : null,
			session_id: sessionId,
			type: "page_view",
			path: "/",
			element: null,
			value: null,
			duration_ms: 1200,
			metadata: { referrer: "https://google.com" },
			created_at: new Date(now.getTime() - 1000 * 60 * 29),
		},
		{
			user_id: user ? user.id : null,
			session_id: sessionId,
			type: "click",
			path: "/signup",
			element: "#signup-button",
			value: null,
			duration_ms: null,
			metadata: { x: 120, y: 300 },
			created_at: new Date(now.getTime() - 1000 * 60 * 28),
		},
		{
			user_id: user ? user.id : null,
			session_id: sessionId,
			type: "form_submit",
			path: "/signup",
			element: "form#signup",
			value: JSON.stringify({ email: "example@example.com" }),
			duration_ms: null,
			metadata: { success: true },
			created_at: new Date(now.getTime() - 1000 * 60 * 27),
		},
		{
			user_id: null,
			session_id: sessionId,
			type: "tab_blur",
			path: "/signup",
			element: null,
			value: null,
			duration_ms: 5000,
			metadata: { visibility: "hidden" },
			created_at: new Date(now.getTime() - 1000 * 60 * 26),
		},
		{
			user_id: user ? user.id : null,
			session_id: sessionId,
			type: "tab_focus",
			path: "/dashboard",
			element: null,
			value: null,
			duration_ms: 200,
			metadata: {},
			created_at: now,
		},
	];

	await knex("events").insert(events);
};
