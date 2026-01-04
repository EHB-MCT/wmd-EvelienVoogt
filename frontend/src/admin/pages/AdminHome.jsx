import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function AdminHome() {
	const [users, setUsers] = useState([]);
	const [selectedUserId, setSelectedUserId] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [sessions, setSessions] = useState([]);
	const [loadingSessions, setLoadingSessions] = useState(false);
	const [selectedSessionId, setSelectedSessionId] = useState("");
	const [profile, setProfile] = useState(null);
	const [loadingProfile, setLoadingProfile] = useState(false);
	const [profileError, setProfileError] = useState("");
	const [events, setEvents] = useState([]);
	const [loadingEvents, setLoadingEvents] = useState(false);
	const [eventsError, setEventsError] = useState("");
	const [eventTypeFilter, setEventTypeFilter] = useState("all");
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		async function loadUsers() {
			try {
				setLoading(true);
				setError("");

				const res = await fetch(`${API_BASE}/api/admin/users`);
				if (!res.ok) throw new Error(`Failed to load users (${res.status})`);

				const data = await res.json();
				const list = data.users || [];

				setUsers(list);

				// auto-select first user
				if (list.length > 0) setSelectedUserId(String(list[0].id));
			} catch (e) {
				console.error(e);
				setError(e.message || "Failed to load users");
			} finally {
				setLoading(false);
			}
		}

		loadUsers();
	}, []);
	useEffect(() => {
		async function loadSessions() {
			if (!selectedUserId) return;

			try {
				setLoadingSessions(true);

				const res = await fetch(`${API_BASE}/api/admin/sessions`);
				if (!res.ok) throw new Error("Failed to load sessions");

				const data = await res.json();
				setSessions(data.sessions || []);
			} catch (e) {
				console.error(e);
			} finally {
				setLoadingSessions(false);
			}
		}

		loadSessions();
	}, [selectedUserId]);

	const selectedUser = users.find((u) => String(u.id) === String(selectedUserId));
	const userSessions = sessions.filter((s) => String(s.user_id) === String(selectedUserId));
	useEffect(() => {
		if (userSessions.length > 0) {
			setSelectedSessionId(userSessions[0].session_id);
		} else {
			setSelectedSessionId("");
			setProfile(null);
		}
	}, [selectedUserId, sessions]);

	useEffect(() => {
		async function loadProfile() {
			if (!selectedSessionId) return;

			try {
				setLoadingProfile(true);
				setProfileError("");

				const res = await fetch(`${API_BASE}/api/admin/sessions/${selectedSessionId}/profile`);
				if (!res.ok) throw new Error(`Failed to load profile (${res.status})`);

				const data = await res.json();
				setProfile(data.profile);
			} catch (e) {
				console.error(e);
				setProfileError(e.message || "Failed to load profile");
				setProfile(null);
			} finally {
				setLoadingProfile(false);
			}
		}

		loadProfile();
	}, [selectedSessionId]);

	useEffect(() => {
		async function loadEvents() {
			if (!selectedSessionId) return;

			try {
				setLoadingEvents(true);
				setEventsError("");

				const res = await fetch(`${API_BASE}/api/admin/sessions/${selectedSessionId}/events`);
				if (!res.ok) throw new Error(`Failed to load events (${res.status})`);

				const data = await res.json();
				setEvents(data.events || []);
			} catch (e) {
				console.error(e);
				setEventsError(e.message || "Failed to load events");
				setEvents([]);
			} finally {
				setLoadingEvents(false);
			}
		}

		loadEvents();
	}, [selectedSessionId]);

	useEffect(() => {
		setEventTypeFilter("all");
		setSearchQuery("");
	}, [selectedSessionId]);

	const normalizedQuery = searchQuery.trim().toLowerCase();

	const filteredEvents = events.filter((ev) => {
		// 1) type filter
		const typeOk = eventTypeFilter === "all" || ev.type === eventTypeFilter;

		// 2) search filter (path, element, value)
		const haystack = [ev.path ?? "", ev.element ?? "", ev.value ?? ""].join(" ").toLowerCase();

		const searchOk = !normalizedQuery || haystack.includes(normalizedQuery);

		return typeOk && searchOk;
	});

	return (
		<div style={{ padding: 16 }}>
			<h2>Admin dashboard</h2>

			{loading && <p>Loading users...</p>}
			{error && <p style={{ color: "crimson" }}>Error: {error}</p>}

			{!loading && !error && (
				<>
					<label>
						Select user:{" "}
						<select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
							{users.map((u) => (
								<option key={u.id} value={u.id}>
									{u.username} — {u.first_name} {u.last_name}
								</option>
							))}
						</select>
					</label>

					{selectedUser && (
						<div style={{ marginTop: 16 }}>
							<h3>User info</h3>
							<ul>
								<li>
									<b>ID:</b> {selectedUser.id}
								</li>
								<li>
									<b>Username:</b> {selectedUser.username}
								</li>
								<li>
									<b>Name:</b> {selectedUser.first_name} {selectedUser.last_name}
								</li>
								<li>
									<b>Email:</b> {selectedUser.email}
								</li>
							</ul>
						</div>
					)}
					{selectedUser && (
						<div style={{ marginTop: 24 }}>
							<h3>Sessions for this user</h3>

							{loadingSessions && <p>Loading sessions...</p>}

							{!loadingSessions && userSessions.length === 0 && <p>No sessions found for this user.</p>}

							{!loadingSessions && userSessions.length > 0 && (
								<ul>
									{userSessions.map((s) => (
										<li key={s.session_id} style={{ marginBottom: 10 }}>
											<button
												onClick={() => setSelectedSessionId(s.session_id)}
												style={{
													fontWeight: s.session_id === selectedSessionId ? "bold" : "normal",
													cursor: "pointer",
													marginBottom: 6,
												}}
											>
												Select
											</button>
											<div>
												<b>Session:</b> {s.session_id}
											</div>
											<div>
												<small>
													{new Date(s.started_at).toLocaleString()} → {new Date(s.ended_at).toLocaleString()}
												</small>
											</div>
											<div>
												<small>
													Events: {s.event_count} | {s.device} · {s.browser}
												</small>
											</div>
										</li>
									))}
								</ul>
							)}
						</div>
					)}
					{selectedSessionId && (
						<div style={{ marginTop: 24 }}>
							<h3>Session profile</h3>
							<p>
								<b>Selected session:</b> {selectedSessionId}
							</p>

							{loadingProfile && <p>Loading profile...</p>}
							{profileError && <p style={{ color: "crimson" }}>Error: {profileError}</p>}

							{!loadingProfile && !profileError && profile && (
								<>
									<h4>Labels</h4>
									{profile.labels?.length ? (
										<ul>
											{profile.labels.map((l) => (
												<li key={l}>{l}</li>
											))}
										</ul>
									) : (
										<p>No labels</p>
									)}

									<h4>Scores</h4>
									<ul>
										{Object.entries(profile.scores || {})
											.filter(([k]) => k !== "labels")
											.map(([k, v]) => (
												<li key={k}>
													<b>{k}:</b> {v}
												</li>
											))}
									</ul>

									<h4>Key metrics</h4>
									<ul>
										<li>
											<b>totalEvents:</b> {profile.metrics?.totalEvents}
										</li>
										<li>
											<b>timerStartCount:</b> {profile.metrics?.timerStartCount}
										</li>
										<li>
											<b>timerCompleteCount:</b> {profile.metrics?.timerCompleteCount}
										</li>
										<li>
											<b>taskCreateCount:</b> {profile.metrics?.taskCreateCount}
										</li>
										<li>
											<b>taskCompleteCount:</b> {profile.metrics?.taskCompleteCount}
										</li>
										<li>
											<b>tabBlurCount:</b> {profile.metrics?.tabBlurCount}
										</li>
										<li>
											<b>avgTabBlurDurationMs:</b> {profile.metrics?.avgTabBlurDurationMs}
										</li>
									</ul>
								</>
							)}
						</div>
					)}
					{selectedSessionId && (
						<div style={{ marginTop: 24 }}>
							<h3>Events timeline</h3>
							{!loadingEvents && !eventsError && events.length > 0 && (
								<div style={{ marginBottom: 12 }}>
									<label style={{ marginRight: 12 }}>
										Type:{" "}
										<select value={eventTypeFilter} onChange={(e) => setEventTypeFilter(e.target.value)}>
											<option value="all">All</option>
											{[...new Set(events.map((e) => e.type))].sort().map((t) => (
												<option key={t} value={t}>
													{t}
												</option>
											))}
										</select>
									</label>

									<label>
										Search: <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="path, element, value..." />
									</label>

									<div style={{ marginTop: 6 }}>
										<small>
											Showing {filteredEvents.length} / {events.length} events
										</small>
									</div>
								</div>
							)}
							{loadingEvents && <p>Loading events...</p>}
							{eventsError && <p style={{ color: "crimson" }}>Error: {eventsError}</p>}

							{!loadingEvents && !eventsError && events.length === 0 && <p>No events found for this session.</p>}

							{!loadingEvents && !eventsError && events.length > 0 && (
								<table border="1" cellPadding="6" style={{ borderCollapse: "collapse" }}>
									<thead>
										<tr>
											<th>Time</th>
											<th>Type</th>
											<th>Path</th>
											<th>Element</th>
											<th>Value</th>
											<th>Duration (ms)</th>
										</tr>
									</thead>
									<tbody>
										{filteredEvents.map((ev) => (
											<tr key={ev.id}>
												<td>{new Date(ev.created_at).toLocaleTimeString()}</td>
												<td>{ev.type}</td>
												<td>{ev.path}</td>
												<td>{ev.element ?? "-"}</td>
												<td>{ev.value ?? "-"}</td>
												<td>{typeof ev.duration_ms === "number" ? ev.duration_ms : "-"}</td>
											</tr>
										))}
									</tbody>
								</table>
							)}
						</div>
					)}
				</>
			)}
		</div>
	);
}
