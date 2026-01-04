import React from "react";
import { Link } from "react-router-dom";
import { trackEvent, msSinceSessionStart } from "../../lib/tracking.js";

export default function UserHome() {
	const onCtaClick = async (cta) => {
		// msSinceSessionStart is set when startSessionOnce() runs in App.jsx
		// (so this will be non-null once session is started)
		const ms = msSinceSessionStart();

		await trackEvent({
			type: "cta_click",
			path: window.location.pathname,
			element: `cta-${cta}`,
			metadata: {
				ms_since_session_start: ms,
			},
		});
	};

	return (
		<div style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
			<header style={{ marginBottom: 24 }}>
				<h1 style={{ margin: 0 }}>FocusFlow</h1>
				<p style={{ marginTop: 8, fontSize: 16, lineHeight: 1.5 }}>Focus in korte blokken. Houd je taken simpel. En laat je sessie-data je subtiel helpen.</p>
				<p style={{ marginTop: 6 }}>
					<small>Maak een profiel voor gepersonaliseerde ervaringen.</small>
				</p>
			</header>

			<div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
				<Link to="/timer" style={{ textDecoration: "none" }}>
					<button onClick={() => onCtaClick("start-focus").catch(console.error)} title="Ga naar de timer">
						Start focussen
					</button>
				</Link>

				<Link to="/tasks" style={{ textDecoration: "none" }}>
					<button onClick={() => onCtaClick("tasks").catch(console.error)} title="Ga naar je taken">
						Naar taken
					</button>
				</Link>

				{/* Auth entry: header shows login/register on every page; keep a short in-page link too */}
				<a href="/register" style={{ textDecoration: "none" }}>
					<button title="Register / log in">Inloggen / registreren</button>
				</a>
			</div>

			<section style={{ marginTop: 24 }}>
				<h3 style={{ marginBottom: 8 }}>Hoe werkt het?</h3>
				<ul style={{ marginTop: 0, lineHeight: 1.6 }}>
					<li>Start een focussessie in de timer.</li>
					<li>Hou je takenlijst bij voor overzicht.</li>
					<li>FocusFlow helpt je focussen met subtiele aanpassingen op basis van je sessiegedrag.</li>
				</ul>
			</section>
		</div>
	);
}
