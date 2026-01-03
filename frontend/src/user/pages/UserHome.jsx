import React, { useState } from "react";
import { trackEvent, msSinceSessionStart } from "../../lib/tracking.js";

export default function UserHome() {
	const [taskTitle, setTaskTitle] = useState("");
	const [tasks, setTasks] = useState([]);

	// --- TIMER EVENTS ---
	const onStartFocus = async () => {
		try {
			await trackEvent({
				type: "timer_start",
				path: window.location.pathname,
				element: "start-focus-button",
				metadata: {
					ms_since_session_start: msSinceSessionStart(),
				},
			});
			console.log("timer_start sent");
		} catch (e) {
			console.error("timer_start failed", e);
		}
	};

	const onCompleteFocus = async () => {
		try {
			await trackEvent({
				type: "timer_complete",
				path: window.location.pathname,
				element: "complete-focus-button",
			});
			console.log("timer_complete sent");
		} catch (e) {
			console.error("timer_complete failed", e);
		}
	};

	const onInterruptFocus = async () => {
		try {
			await trackEvent({
				type: "timer_interrupt",
				path: window.location.pathname,
				element: "interrupt-focus-button",
			});
			console.log("timer_interrupt sent");
		} catch (e) {
			console.error("timer_interrupt failed", e);
		}
	};

	// --- TASK CREATE ---
	const onCreateTask = async (e) => {
		e.preventDefault();

		const title = taskTitle.trim();
		if (!title) return;

		const id = crypto.randomUUID();
		const createdAt = Date.now();

		setTasks((prev) => [{ id, title, done: false, createdAt }, ...prev]);
		setTaskTitle("");

		try {
			await trackEvent({
				type: "task_create",
				path: window.location.pathname,
				element: "task-create-form",
				value: title,
				metadata: {
					task_id: id,
					ms_since_session_start: msSinceSessionStart(),
				},
			});
			console.log("task_create sent", { task_id: id });
		} catch (e) {
			console.error("task_create failed", e);
		}
	};

	// --- TASK TOGGLE ---
	const toggleTask = async (task) => {
		const newDone = !task.done;

		setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, done: newDone } : t)));

		try {
			await trackEvent({
				type: "task_complete",
				path: window.location.pathname,
				element: "task-toggle",
				metadata: { task_id: task.id, done: newDone },
			});
			console.log("task_complete sent", {
				task_id: task.id,
				done: newDone,
			});
		} catch (e) {
			console.error("task_complete failed", e);
		}
	};

	// --- TASK DELETE ---
	const deleteTask = async (task) => {
		setTasks((prev) => prev.filter((t) => t.id !== task.id));

		try {
			await trackEvent({
				type: "task_delete",
				path: window.location.pathname,
				element: "task-delete",
				metadata: { task_id: task.id },
			});
			console.log("task_delete sent", { task_id: task.id });
		} catch (e) {
			console.error("task_delete failed", e);
		}
	};

	return (
		<div>
			<h2>User app</h2>

			<div style={{ marginBottom: 16 }}>
				<button onClick={onStartFocus}>Start focus</button> <button onClick={onCompleteFocus}>Complete focus</button> <button onClick={onInterruptFocus}>Stop</button>
			</div>

			<hr />

			<h3>Tasks</h3>

			<form onSubmit={onCreateTask} style={{ marginBottom: 12 }}>
				<input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="New task..." /> <button type="submit">Add</button>
			</form>

			<ul>
				{tasks.map((t) => (
					<li key={t.id}>
						<button onClick={() => toggleTask(t)}>{t.done ? "Undo" : "Done"}</button> {t.done ? <s>{t.title}</s> : t.title} <button onClick={() => deleteTask(t)}>Delete</button>
					</li>
				))}
			</ul>
		</div>
	);
}
