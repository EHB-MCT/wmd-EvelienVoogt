import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import UserHome from "./user/pages/UserHome.jsx";
import TimerPage from "./user/pages/TimerPage.jsx";
import TasksPage from "./user/pages/TasksPage.jsx";
import AdminHome from "./admin/pages/AdminHome.jsx";
import { startSessionOnce, trackEvent } from "./lib/tracking.js";
import PageViewTracker from "./lib/PageViewTracker.jsx";
import IdleTracker from "./lib/IdleTracker.jsx";

export default function App() {
	useEffect(() => {
		console.log("App mounted");

		startSessionOnce()
			.then((sid) => {
				console.log("Session started:", sid);
			})
			.catch((err) => {
				console.error("Failed to start session", err);
			});

		const onFocus = () => {
			console.log("TAB FOCUS", {
				path: window.location.pathname,
				visibility: document.visibilityState,
			});

			trackEvent({
				type: "tab_focus",
				path: window.location.pathname,
				element: "window",
				metadata: { visibility: document.visibilityState },
			})
				.then(() => {
					console.log("tab_focus event sent");
				})
				.catch(console.error);
		};

		const onBlur = () => {
			console.log("TAB BLUR", {
				path: window.location.pathname,
				visibility: document.visibilityState,
			});

			trackEvent({
				type: "tab_blur",
				path: window.location.pathname,
				element: "window",
				metadata: { visibility: document.visibilityState },
			})
				.then(() => {
					console.log("tab_blur event sent");
				})
				.catch(console.error);
		};

		window.addEventListener("focus", onFocus);
		window.addEventListener("blur", onBlur);

		return () => {
			window.removeEventListener("focus", onFocus);
			window.removeEventListener("blur", onBlur);
		};
	}, []);

	return (
		<BrowserRouter>
			<PageViewTracker />
			<PageViewTracker />
			<IdleTracker idleMs={30000} />
			<nav style={{ marginBottom: 16 }}>
				<Link to="/">Home</Link> | <Link to="/timer">Timer</Link> | <Link to="/tasks">Tasks</Link> | <Link to="/admin">Admin</Link>
			</nav>

			<Routes>
				<Route path="/" element={<UserHome />} />
				<Route path="/timer" element={<TimerPage />} />
				<Route path="/tasks" element={<TasksPage />} />
				<Route path="/admin" element={<AdminHome />} />
			</Routes>
		</BrowserRouter>
	);
}
