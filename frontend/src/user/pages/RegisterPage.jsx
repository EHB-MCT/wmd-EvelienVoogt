import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/AuthProvider";

export default function RegisterPage() {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);
	const [loading, setLoading] = useState(false);
	const auth = useAuth();
	const nav = useNavigate();

	const submit = async (e) => {
		e.preventDefault();
		setError(null);
		setSuccess(null);
		setLoading(true);

		try {
			await auth.register({
				username,
				email,
				password,
				first_name: firstName,
				last_name: lastName,
			});

			setSuccess("Registered! Logging you in...");

			try {
				await auth.login({ username, password });
				nav("/");
			} catch (loginErr) {
				// If auto-login fails, fallback: send user to the login page with a message
				setError(loginErr.message || "Registered, but auto-login failed. Please log in.");
				nav("/login");
			}
		} catch (err) {
			setError(err.message || "Register failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div style={{ padding: 24, maxWidth: 520, margin: "0 auto" }}>
			<h2>Register</h2>
			<form onSubmit={submit}>
				<div style={{ marginBottom: 8 }}>
					<input placeholder="first name" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={loading} />
				</div>
				<div style={{ marginBottom: 8 }}>
					<input placeholder="last name" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={loading} />
				</div>
				<div style={{ marginBottom: 8 }}>
					<input placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} disabled={loading} />
				</div>
				<div style={{ marginBottom: 8 }}>
					<input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
				</div>
				<div style={{ marginBottom: 8 }}>
					<input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
				</div>
				{error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
				{success && <div style={{ color: "green", marginBottom: 8 }}>{success}</div>}
				<button type="submit" disabled={loading}>
					{loading ? "Registering…" : "Register"}
				</button>
			</form>
		</div>
	);
}
