import { getSessionId } from "./tracking.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export async function fetchSessionProfile(sessionId = getSessionId()) {
  if (!sessionId) throw new Error("No session_id available");

  const res = await fetch(`${API_BASE}/api/profile/session/${sessionId}`);
  if (!res.ok) throw new Error(`Failed to fetch session profile (${res.status})`);

  const data = await res.json();
  return data.profile ?? data;
}
