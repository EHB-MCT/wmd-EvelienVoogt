import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function AdminHome() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sessions, setSessions] = useState([]);
const [loadingSessions, setLoadingSessions] = useState(false);

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
  const userSessions = sessions.filter(
  (s) => String(s.user_id) === String(selectedUserId)
);


  return (
    <div style={{ padding: 16 }}>
      <h2>Admin dashboard</h2>

      {loading && <p>Loading users...</p>}
      {error && <p style={{ color: "crimson" }}>Error: {error}</p>}

      {!loading && !error && (
        <>
          <label>
            Select user:{" "}
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
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

    {!loadingSessions && userSessions.length === 0 && (
      <p>No sessions found for this user.</p>
    )}

    {!loadingSessions && userSessions.length > 0 && (
      <ul>
        {userSessions.map((s) => (
          <li key={s.session_id}>
            <div>
              <b>Session:</b> {s.session_id}
            </div>
            <div>
              <small>
                {new Date(s.started_at).toLocaleString()} →{" "}
                {new Date(s.ended_at).toLocaleString()}
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
  );
}
