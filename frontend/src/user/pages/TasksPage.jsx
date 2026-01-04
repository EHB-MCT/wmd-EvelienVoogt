import React, { useState } from "react";
import { trackEvent, msSinceSessionStart } from "../../lib/tracking";
import { createProfileManager } from "../../lib/profileManager.js";

export default function TasksPage() {
	const [taskTitle, setTaskTitle] = useState("");
	const [tasks, setTasks] = useState([]);
	const [editingTaskId, setEditingTaskId] = useState(null);
	const [editValue, setEditValue] = useState("");

	const startEditing = (task) => {
		setEditingTaskId(task.id);
		setEditValue(task.title);
	};
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

	// --- TASK EDIT ---
	const saveEdit = async (task) => {
		const newTitle = editValue.trim();

		if (!newTitle) return;
		setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, title: newTitle } : t)));
		setEditingTaskId(null);
		try {
			await trackEvent({
				type: "task_edit",
				path: window.location.pathname,
				element: "task-title",
				value: newTitle,
				metadata: { task_id: task.id },
			});
			console.log("task_edit sent", { task_id: task.id });
		} catch (e) {
			console.error("task_edit failed", e);
		}
	};

	const mgrRef = React.useRef(null);

	const [labels, setLabels] = React.useState([]);
	const [tip, setTip] = React.useState("");
	const [profileError, setProfileError] = React.useState("");
	const [profileLoading, setProfileLoading] = React.useState(false);

	React.useEffect(() => {
		mgrRef.current = createProfileManager();

		async function loadProfile() {
			try {
				setProfileLoading(true);
				setProfileError("");

				await mgrRef.current.load();

				const nextLabels = mgrRef.current.getLabels();
				setLabels(nextLabels);

				setTip(mgrRef.current.pickTip());
			} catch (e) {
				setProfileError(e.message || "Failed to load profile");
				setLabels([]);
				setTip("");
			} finally {
				setProfileLoading(false);
			}
		}

		loadProfile().catch(console.error);
	}, []);

	return (
		<div>
			<h3>Tasks</h3>
			{tip && (
				<div className="hint-banner">
					<small>{tip}</small>
				</div>
			)}

			<form onSubmit={onCreateTask} style={{ marginBottom: 12 }}>
				<input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="New task..." /> <button type="submit">Add</button>
			</form>

			<ul>
				{tasks.map((t) => (
					<li key={t.id}>
						<button onClick={() => toggleTask(t)}>{t.done ? "Undo" : "Done"}</button>{" "}
						{editingTaskId === t.id ? (
							<input
								value={editValue}
								onChange={(e) => setEditValue(e.target.value)}
								autoFocus
								onBlur={() => saveEdit(t)}
								onKeyDown={(e) => {
									if (e.key === "Enter") saveEdit(t);
									if (e.key === "Escape") setEditingTaskId(null);
								}}
							/>
						) : (
							<span onClick={() => startEditing(t)} style={{ cursor: "pointer", userSelect: "none" }} title="Click to edit">
								{t.done ? <s>{t.title}</s> : t.title}
							</span>
						)}{" "}
						<button onClick={() => deleteTask(t)}>Delete</button>
					</li>
				))}
			</ul>
		</div>
	);
}
