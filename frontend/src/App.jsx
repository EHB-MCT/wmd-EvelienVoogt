import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import UserHome from "./user/pages/UserHome.jsx";
import TimerPage from "./user/pages/TimerPage.jsx";
import TasksPage from "./user/pages/TasksPage.jsx";
import AdminHome from "./admin/pages/AdminHome.jsx";
import LoginPage from "./user/pages/LoginPage.jsx";
import RegisterPage from "./user/pages/RegisterPage.jsx";
import Header from "./components/Header.jsx";
import { AuthProvider } from "./lib/AuthProvider";
import { startSessionOnce, trackEvent } from "./lib/tracking.js";
import PageViewTracker from "./lib/PageViewTracker.jsx";
import IdleTracker from "./lib/IdleTracker.jsx";

export default function App() {
	const location = useLocation();

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

	useEffect(() => {
		// Add a body class so CSS can target admin vs user themes
		const isAdmin = location.pathname.startsWith("/admin");
		document.body.classList.add(isAdmin ? "admin" : "user");
		document.body.classList.remove(isAdmin ? "user" : "admin");
	}, [location.pathname]);

	return (
		<AuthProvider>
			<PageViewTracker />
			<IdleTracker idleMs={30000} />

			<div className="app">
				<Header />

				<Routes>
					<Route path="/" element={<UserHome />} />
					<Route path="/timer" element={<TimerPage />} />
					<Route path="/tasks" element={<TasksPage />} />
					<Route path="/admin" element={<AdminHome />} />
					<Route path="/login" element={<LoginPage />} />
					<Route path="/register" element={<RegisterPage />} />
				</Routes>
			</div>
		</AuthProvider>
	);
}
