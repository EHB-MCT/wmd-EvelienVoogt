const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export function getSessionId() {
  return localStorage.getItem("session_id");
}

export function clearSession() {
  localStorage.removeItem("session_id");
}

export async function startSessionOnce() {
  // if we already have a session_id, reuse it
  const existing = getSessionId();
  if (existing) return existing;

  const payload = {
    language: navigator.language,
    viewport_w: window.innerWidth,
    viewport_h: window.innerHeight,

    // later: fill these with real data
    device: null,
    browser: null,
    os: null,
  };

  const res = await fetch(`${API_BASE}/api/sessions/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to start session (${res.status})`);
  }

  const data = await res.json();
  if (!data.session_id) {
    throw new Error("Backend did not return session_id");
  }

  localStorage.setItem("session_id", data.session_id);
  return data.session_id;
}
