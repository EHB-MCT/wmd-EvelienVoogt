import React, { useEffect, useState } from "react";
import { useAuth } from "../../lib/AuthProvider";
import { useNavigate } from "react-router-dom";
import { getAuthToken } from "../../lib/auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function AdminHome() {
	const auth = useAuth();
	const nav = useNavigate();

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
	const [allSessions, setAllSessions] = useState([]);
	const [labelsBySessionId, setLabelsBySessionId] = useState({}); // { [session_id]: ["Focused", ...] }
	const [loadingOverview, setLoadingOverview] = useState(false);
	const [overviewError, setOverviewError] = useState("");
	const [globalLabelFilter, setGlobalLabelFilter] = useState("all");
	const [viewMode, setViewMode] = useState("overview"); // "overview" | "user"

	useEffect(() => {
		// protect client-side: if not admin redirect away
		if (!auth || (!auth.loading && !auth.user?.is_admin)) {
			nav("/");
			return;
		}

		async function loadUsers() {
			try {
				setLoading(true);
				setError("");

				const token = getAuthToken();
				const res = await fetch(`${API_BASE}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
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

				const token = getAuthToken();
				const res = await fetch(`${API_BASE}/api/admin/sessions`, { headers: { Authorization: `Bearer ${token}` } });
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
	const userSessions = allSessions.filter((s) => String(s.user_id) === String(selectedUserId));

	useEffect(() => {
		if (userSessions.length > 0) {
			setSelectedSessionId(userSessions[0].session_id);
		} else {
			setSelectedSessionId("");
			setProfile(null);
		}
	}, [selectedUserId, allSessions]);

	useEffect(() => {
		async function loadProfile() {
			if (!selectedSessionId) return;

			try {
				setLoadingProfile(true);
				setProfileError("");

				const token = getAuthToken();
				const res = await fetch(`${API_BASE}/api/admin/sessions/${selectedSessionId}/profile`, { headers: { Authorization: `Bearer ${token}` } });
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

				const token = getAuthToken();
				const res = await fetch(`${API_BASE}/api/admin/sessions/${selectedSessionId}/events`, { headers: { Authorization: `Bearer ${token}` } });
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

	useEffect(() => {
		async function loadAllSessions() {
			try {
				setLoadingOverview(true);
				setOverviewError("");

				const token = getAuthToken();
				const res = await fetch(`${API_BASE}/api/admin/sessions`, { headers: { Authorization: `Bearer ${token}` } });
				if (!res.ok) throw new Error(`Failed to load sessions (${res.status})`);

				const data = await res.json();
				setAllSessions(data.sessions || []);
			} catch (e) {
				console.error(e);
				setOverviewError(e.message || "Failed to load sessions");
				setAllSessions([]);
			} finally {
				setLoadingOverview(false);
			}
		}

		loadAllSessions();
	}, []);

	useEffect(() => {
		async function loadLabelsForSessions() {
			if (!allSessions.length) return;

			const missing = allSessions.map((s) => s.session_id).filter((id) => !labelsBySessionId[id]);

			if (!missing.length) return;

			try {
				const batch = missing.slice(0, 50);

				const results = await Promise.all(
					batch.map(async (sessionId) => {
						const res = await fetch(`${API_BASE}/api/admin/sessions/${sessionId}/profile`);
						if (!res.ok) return [sessionId, []];

						const data = await res.json();
						return [sessionId, data.profile?.labels || []];
					})
				);

				setLabelsBySessionId((prev) => {
					const next = { ...prev };
					for (const [sid, labels] of results) next[sid] = labels;
					return next;
				});
			} catch (e) {
				console.error(e);
			}
		}

		loadLabelsForSessions();
	}, [allSessions]);

	useEffect(() => {
		if (globalLabelFilter === "all") return;
		const first = allSessions.find((s) => {
			const labels = labelsBySessionId[s.session_id] || [];
			return labels.includes(globalLabelFilter);
		});
		if (first) setSelectedSessionId(first.session_id);
	}, [globalLabelFilter, allSessions, labelsBySessionId]);

	const sessionCount = allSessions.length;

	const avgEventCount = sessionCount === 0 ? 0 : Math.round(allSessions.reduce((sum, s) => sum + Number(s.event_count || 0), 0) / sessionCount);

	const labelCounts = Object.entries(labelsBySessionId).reduce((acc, [, labels]) => {
		(labels || []).forEach((l) => {
			acc[l] = (acc[l] || 0) + 1;
		});
		return acc;
	}, {});

	const globallyFilteredSessions = allSessions.filter((s) => {
		if (globalLabelFilter === "all") return true;
		const labels = labelsBySessionId[s.session_id] || [];
		return labels.includes(globalLabelFilter);
	});

	return (
		<div style={{ padding: 16 }}>
			<h2>Admin dashboard</h2>
			<div style={{ marginBottom: 12 }}>
				<button
					onClick={() => setViewMode("overview")}
					style={{
						fontWeight: viewMode === "overview" ? "bold" : "normal",
						marginRight: 8,
						cursor: "pointer",
					}}
				>
					Total overview
				</button>

				<button
					onClick={() => setViewMode("user")}
					style={{
						fontWeight: viewMode === "user" ? "bold" : "normal",
						cursor: "pointer",
					}}
				>
					User detail
				</button>
			</div>

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "1fr 1.2fr",
					gap: 16,
					alignItems: "start",
				}}
			>
				{viewMode === "overview" && (
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
							gap: 16,
							alignItems: "start",
						}}
					>
						{/* LEFT: Overview + All sessions */}
						<div>
							<div style={{ marginTop: 12, padding: 12, border: "1px solid #ddd" }}>
								<h3>Overview</h3>

								{loadingOverview && <p>Loading overview...</p>}
								{overviewError && <p style={{ color: "crimson" }}>Error: {overviewError}</p>}

								{!loadingOverview && !overviewError && (
									<>
										<ul>
											<li>
												<b>Total sessions:</b> {sessionCount}
											</li>
											<li>
												<b>Average event_count:</b> {avgEventCount}
											</li>
										</ul>

										<h4>Sessions per label</h4>

										{Object.keys(labelCounts).length === 0 ? (
											<p>
												<small>Loading labels… (profiles are computed per session)</small>
											</p>
										) : (
											<ul>
												{Object.entries(labelCounts)
													.sort((a, b) => b[1] - a[1])
													.map(([label, count]) => (
														<li key={label}>
															<button onClick={() => setGlobalLabelFilter(label)} style={{ cursor: "pointer", marginRight: 8 }}>
																Show sessions
															</button>
															<b>{label}:</b> {count}
														</li>
													))}
											</ul>
										)}

										{globalLabelFilter !== "all" && (
											<p>
												<small>
													Active label filter: <b>{globalLabelFilter}</b> <button onClick={() => setGlobalLabelFilter("all")}>Clear</button>
												</small>
											</p>
										)}
									</>
								)}
							</div>

							<div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd" }}>
								<h3>All sessions</h3>

								{globalLabelFilter !== "all" && (
									<p>
										<small>
											Showing sessions with label: <b>{globalLabelFilter}</b>
										</small>
									</p>
								)}

								{globallyFilteredSessions.length === 0 ? (
									<p>No sessions match this filter.</p>
								) : (
									<ul>
										{globallyFilteredSessions.map((s) => {
											const labels = labelsBySessionId[s.session_id] || [];
											return (
												<li key={s.session_id} style={{ marginBottom: 10 }}>
													<button onClick={() => setSelectedSessionId(s.session_id)} style={{ cursor: "pointer", marginRight: 8 }}>
														Open
													</button>
													<b>{s.session_id}</b> — {s.username} ({s.email}) — events: {s.event_count}
													{labels.length > 0 && (
														<div>
															<small>Labels: {labels.join(", ")}</small>
														</div>
													)}
												</li>
											);
										})}
									</ul>
								)}
							</div>
						</div>

						{/* RIGHT: Session profile */}
						<div style={{ marginTop: 12, padding: 12, border: "1px solid #ddd" }}>
							<h3>Session profile</h3>

							{!selectedSessionId && <p>Select a session to see its profile.</p>}

							{selectedSessionId && (
								<>
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
								</>
							)}
						</div>

						{/* FULL WIDTH: Events timeline */}
						{selectedSessionId && (
							<div
								style={{
									gridColumn: "1 / -1",
									marginTop: 0,
									padding: 12,
									border: "1px solid #ddd",
								}}
							>
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
									<table border="1" cellPadding="6" style={{ borderCollapse: "collapse", width: "100%" }}>
										<thead>
											<tr>
												<th>Time</th>
												<th>Type</th>
												<th>Path</th>
												<th>Element</th>
												<th>Value</th>
												<th>Duration (ms)</th>
												<th>Metadata</th>
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
													<td style={{ maxWidth: 420, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{ev.metadata ? JSON.stringify(ev.metadata, null, 2) : "-"}</td>
												</tr>
											))}
										</tbody>
									</table>
								)}
							</div>
						)}
					</div>
				)}

				{viewMode === "user" && (
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
							gap: 16,
							alignItems: "start",
						}}
					>
						{/* LEFT: User selector + user sessions */}
						<div style={{ padding: 12, border: "1px solid #ddd" }}>
							<h3>User detail</h3>

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
											<h4>User info</h4>
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
										<div style={{ marginTop: 16 }}>
											<h4>Sessions for this user</h4>

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
								</>
							)}
						</div>

						{/* RIGHT: Session profile */}
						<div style={{ padding: 12, border: "1px solid #ddd" }}>
							<h3>Session profile</h3>

							{!selectedSessionId && <p>Select a session to see its profile.</p>}

							{selectedSessionId && (
								<>
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
								</>
							)}
						</div>

						{/* FULL WIDTH: Events timeline */}
						{selectedSessionId && (
							<div style={{ gridColumn: "1 / -1", padding: 12, border: "1px solid #ddd" }}>
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
									<table border="1" cellPadding="6" style={{ borderCollapse: "collapse", width: "100%" }}>
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
					</div>
				)}
			</div>
		</div>
	);
}
