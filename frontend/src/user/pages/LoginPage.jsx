import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/AuthProvider";

export default function LoginPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState(null);
	const auth = useAuth();
	const nav = useNavigate();

	const submit = async (e) => {
		e.preventDefault();
		setError(null);
		try {
			await auth.login({ username, password });
			nav("/");
		} catch (err) {
			setError(err.message || "Login failed");
		}
	};

	return (
		<div style={{ padding: 24, maxWidth: 420, margin: "0 auto" }}>
			<h2>Log in</h2>
			<form onSubmit={submit}>
				<div style={{ marginBottom: 8 }}>
					<input placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
				</div>
				<div style={{ marginBottom: 8 }}>
					<input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
				</div>
				{error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
				<button type="submit">Log in</button>
			</form>
		</div>
	);
}
