import React, { createContext, useContext, useEffect, useState } from "react";
import { getAuthToken, setAuthToken, login as apiLogin, register as apiRegister, attachSessionToUser } from "./auth";
import { getSessionId } from "./tracking";

const AuthContext = createContext(null);

export function useAuth() {
	return useContext(AuthContext);
}

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// On mount, see if there's a token and try to decode minimal info (server doesn't expose /me endpoint)
		const token = getAuthToken();
		if (!token) {
			setLoading(false);
			return;
		}

		// Decode basic payload from token (unsafe but acceptable for UI state)
		try {
			const payload = JSON.parse(atob(token.split(".")[1]));
			setUser({ id: payload.user_id, username: payload.username, is_admin: !!payload.is_admin });
		} catch (err) {
			// invalid token — clear it
			setAuthToken(null);
		}

		setLoading(false);
	}, []);

	async function login(credentials) {
		const data = await apiLogin(credentials);
		setAuthToken(data.token);
		setUser(data.user);

		// Attach existing session if present
		try {
			const sid = getSessionId();
			if (sid) await attachSessionToUser(sid, data.token);
		} catch (err) {
			// ignore attach errors for now
			console.warn("attach session failed", err);
		}

		return data.user;
	}

	async function register(info) {
		const user = await apiRegister(info);
		// After register we don't automatically log in — require explicit login (optional page handles auto-login)
		return user;
	}

	function logout() {
		setAuthToken(null);
		setUser(null);
	}

	return <AuthContext.Provider value={{ user, loading, login, logout, register }}>{children}</AuthContext.Provider>;
}
