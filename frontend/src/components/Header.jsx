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
		<header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
			<div>
				<Link to="/">FocusFlow</Link>
			</div>

			<nav>
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
						<span style={{ marginRight: 8 }}>Hi, {user.first_name || user.username}</span>
						<button onClick={onLogout}>Log out</button>
					</>
				) : (
					<>
						<Link to="/login" style={{ marginRight: 8 }}>
							<button>Log in</button>
						</Link>
						<Link to="/register">
							<button>Register</button>
						</Link>
					</>
				)}
			</div>
		</header>
	);
}
