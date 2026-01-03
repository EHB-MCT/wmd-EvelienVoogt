import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function AdminHome() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const selectedUser = users.find((u) => String(u.id) === String(selectedUserId));

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
        </>
      )}
    </div>
  );
}
