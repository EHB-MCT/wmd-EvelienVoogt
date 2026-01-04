const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export function getAuthToken() {
	return localStorage.getItem("auth_token");
}

export function setAuthToken(token) {
	if (token) localStorage.setItem("auth_token", token);
	else localStorage.removeItem("auth_token");
}

export async function register(payload) {
	const res = await fetch(`${API_BASE}/api/auth/register`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	const data = await res.json();
	if (!res.ok) throw new Error(data.error || "register_failed");
	return data.user;
}

export async function login({ username, password }) {
	const res = await fetch(`${API_BASE}/api/auth/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ username, password }),
	});

	const data = await res.json();
	if (!res.ok) throw new Error(data.error || "login_failed");
	return data; // { token, user }
}

export async function attachSessionToUser(sessionId, token) {
	if (!sessionId) return;
	const res = await fetch(`${API_BASE}/api/sessions/attach-user`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ session_id: sessionId }),
	});

	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.error || "attach_failed");
	}

	return true;
}
