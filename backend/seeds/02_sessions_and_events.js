exports.seed = async function (knex) {
	// Deletes existing entries to keep seed idempotent
	await knex("events").del();
	await knex("sessions").del();

	// Attach to seeded users when available
	const admin = await knex("users").where({ email: "admin@example.com" }).first();
	const alice = await knex("users").where({ email: "alice@example.com" }).first();

	const now = new Date();

	// Session for admin: mixed behavior, some procrastination signals
	const adminSessionId = "session_admin_1";
	const adminSession = {
		user_id: admin ? admin.id : null,
		session_id: adminSessionId,
		started_at: new Date(now.getTime() - 1000 * 60 * 45), // 45 minutes ago
		ended_at: now,
		device: "desktop",
		browser: "Chrome 121",
		os: "Windows 10",
		language: "en-US",
		viewport_w: 1366,
		viewport_h: 768,
	};

	// Session for a guest (alice): engaged, small idle, focused
	const aliceSessionId = "session_alice_1";
	const aliceSession = {
		user_id: alice ? alice.id : null,
		session_id: aliceSessionId,
		started_at: new Date(now.getTime() - 1000 * 60 * 20), // 20 minutes ago
		ended_at: now,
		device: "mobile",
		browser: "Safari Mobile",
		os: "iOS 17",
		language: "en-US",
		viewport_w: 390,
		viewport_h: 844,
	};

	await knex("sessions").insert([adminSession, aliceSession]);

	const events = [];

	// Admin events
	events.push(
		// early page view
		{
			user_id: admin ? admin.id : null,
			session_id: adminSessionId,
			type: "page_view",
			path: "/",
			element: null,
			value: null,
			duration_ms: 1200,
			metadata: { referrer: "https://google.com" },
			created_at: new Date(now.getTime() - 1000 * 60 * 44),
		},
		// a couple of clicks
		{
			user_id: admin ? admin.id : null,
			session_id: adminSessionId,
			type: "click",
			path: "/tasks",
			element: "#task-list",
			created_at: new Date(now.getTime() - 1000 * 60 * 42),
		},
		{
			user_id: admin ? admin.id : null,
			session_id: adminSessionId,
			type: "task_create",
			path: "/tasks",
			element: "task-create-form",
			value: "Write report",
			metadata: { task_id: "a1", ms_since_session_start: 120000 },
			created_at: new Date(now.getTime() - 1000 * 60 * 41),
		},
		// edits to show indecision
		{
			user_id: admin ? admin.id : null,
			session_id: adminSessionId,
			type: "task_edit",
			path: "/tasks",
			element: "task-title",
			value: "Write report (outline)",
			metadata: { task_id: "a1" },
			created_at: new Date(now.getTime() - 1000 * 60 * 40),
		},
		{
			user_id: admin ? admin.id : null,
			session_id: adminSessionId,
			type: "task_edit",
			path: "/tasks",
			element: "task-title",
			value: "Write report (draft)",
			metadata: { task_id: "a1" },
			created_at: new Date(now.getTime() - 1000 * 60 * 39),
		},
		// task created but not completed
		{
			user_id: admin ? admin.id : null,
			session_id: adminSessionId,
			type: "task_create",
			path: "/tasks",
			element: "task-create-form",
			value: "Prepare slides",
			metadata: { task_id: "a2" },
			created_at: new Date(now.getTime() - 1000 * 60 * 38),
		},
		// timer started but interrupted
		{
			user_id: admin ? admin.id : null,
			session_id: adminSessionId,
			type: "timer_start",
			path: "/tasks",
			element: "start-focus-button",
			metadata: { ms_since_session_start: 100000 },
			created_at: new Date(now.getTime() - 1000 * 60 * 35),
		},
		{
			user_id: admin ? admin.id : null,
			session_id: adminSessionId,
			type: "timer_interrupt",
			path: "/tasks",
			element: "interrupt-focus-button",
			created_at: new Date(now.getTime() - 1000 * 60 * 34),
		},
		// tab blur and long idle
		{
			user_id: admin ? admin.id : null,
			session_id: adminSessionId,
			type: "tab_blur",
			path: "/tasks",
			duration_ms: 30000,
			metadata: { visibility: "hidden" },
			created_at: new Date(now.getTime() - 1000 * 60 * 33),
		},
		{
			user_id: admin ? admin.id : null,
			session_id: adminSessionId,
			type: "idle_start",
			path: "/tasks",
			created_at: new Date(now.getTime() - 1000 * 60 * 32),
		},
		{
			user_id: admin ? admin.id : null,
			session_id: adminSessionId,
			type: "idle_end",
			path: "/tasks",
			duration_ms: 90000,
			metadata: { activity: "mousemove" },
			created_at: new Date(now.getTime() - 1000 * 60 * 31),
		},
		// later a timer completed
		{
			user_id: admin ? admin.id : null,
			session_id: adminSessionId,
			type: "timer_start",
			path: "/tasks",
			created_at: new Date(now.getTime() - 1000 * 60 * 20),
		},
		{
			user_id: admin ? admin.id : null,
			session_id: adminSessionId,
			type: "timer_complete",
			path: "/tasks",
			created_at: new Date(now.getTime() - 1000 * 60 * 15),
		}
	);

	// Alice events (engaged user)
	events.push(
		{
			user_id: alice ? alice.id : null,
			session_id: aliceSessionId,
			type: "page_view",
			path: "/tasks",
			duration_ms: 600,
			metadata: { from: "/" },
			created_at: new Date(now.getTime() - 1000 * 60 * 18),
		},
		// creates and completes tasks
		{
			user_id: alice ? alice.id : null,
			session_id: aliceSessionId,
			type: "task_create",
			path: "/tasks",
			value: "Buy groceries",
			metadata: { task_id: "b1" },
			created_at: new Date(now.getTime() - 1000 * 60 * 17),
		},
		{
			user_id: alice ? alice.id : null,
			session_id: aliceSessionId,
			type: "task_complete",
			path: "/tasks",
			metadata: { task_id: "b1", done: true },
			created_at: new Date(now.getTime() - 1000 * 60 * 16),
		},
		// short focused timer
		{
			user_id: alice ? alice.id : null,
			session_id: aliceSessionId,
			type: "timer_start",
			path: "/tasks",
			created_at: new Date(now.getTime() - 1000 * 60 * 14),
		},
		{
			user_id: alice ? alice.id : null,
			session_id: aliceSessionId,
			type: "timer_complete",
			path: "/tasks",
			created_at: new Date(now.getTime() - 1000 * 60 * 12),
		},
		// a few clicks and a small tab blur
		{
			user_id: alice ? alice.id : null,
			session_id: aliceSessionId,
			type: "click",
			path: "/tasks",
			element: "#complete-b1",
			created_at: new Date(now.getTime() - 1000 * 60 * 11),
		},
		{
			user_id: alice ? alice.id : null,
			session_id: aliceSessionId,
			type: "tab_blur",
			path: "/tasks",
			duration_ms: 2000,
			created_at: new Date(now.getTime() - 1000 * 60 * 10),
		}
	);

	await knex("events").insert(events);
};
