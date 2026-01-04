import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthProvider";

export default function Header() {
	const { user, logout } = useAuth();
	const nav = useNavigate();

	const onLogout = () => {
		logout();
		nav("/");
	};

	return (
		<header className="site-header">
			<div>
				<Link to="/" className="logo">FocusFlow</Link>
			</div>

			<nav className="main-nav">
				<Link to="/">Home</Link> | <Link to="/timer">Timer</Link> | <Link to="/tasks">Tasks</Link>
				{user && user.is_admin && (
					<span>
						{" "}
						| <Link to="/admin">Admin</Link>
					</span>
				)}{" "}
			</nav>
			<div>
				{user ? (
					<>
						<span className="greeting">Hi, {user.first_name || user.username}</span>
						<button className="btn" onClick={onLogout}>Log out</button>
					</>
				) : (
					<>
						<Link to="/login" className="auth-link">
							<button className="btn secondary">Log in</button>
						</Link>
						<Link to="/register">
							<button className="btn">Register</button>
						</Link>
					</>
				)}
			</div>
		</header>
	);
}
