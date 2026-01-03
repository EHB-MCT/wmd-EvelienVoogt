const { buildProfile } = require("../src/services/profiling-service");

const events = [
	{ type: "page_view", path: "/", duration_ms: 1200 },
	{ type: "page_view", path: "/tasks", duration_ms: 800 },
	{ type: "click", path: "/tasks" },
	{ type: "click", path: "/tasks" },
	{ type: "click", path: "/tasks" },
	{ type: "form_submit", path: "/signup" },

	// tasks
	{ type: "task_create", path: "/tasks", metadata: { task_id: "t1" } },
	{ type: "task_create", path: "/tasks", metadata: { task_id: "t2" } },
	{ type: "task_create", path: "/tasks", metadata: { task_id: "t3" } },
	{ type: "task_edit", path: "/tasks", metadata: { task_id: "t1" } },
	{ type: "task_edit", path: "/tasks", metadata: { task_id: "t1" } },
	{ type: "task_complete", path: "/tasks", metadata: { task_id: "t2" } },

	// timers
	{ type: "timer_start", path: "/tasks" },
	{ type: "timer_start", path: "/tasks" },
	{ type: "timer_complete", path: "/tasks" },
	{ type: "timer_interrupt", path: "/tasks" },

	// idle and tab blur
	{ type: "idle_start", path: "/tasks" },
	{ type: "idle_end", path: "/tasks", duration_ms: 45000, metadata: { activity: "mousemove" } },
	{ type: "tab_blur", path: "/tasks", duration_ms: 15000 },
	{ type: "tab_blur", path: "/tasks", duration_ms: 40000 },
	{ type: "tab_focus", path: "/tasks" },
];

console.log(JSON.stringify(buildProfile(events), null, 2));
