import React from "react";
import { trackEvent, msSinceSessionStart } from "../../lib/tracking";

export default function TimerPage() {
	const [elapsed, setElapsed] = React.useState(0); // seconds
	const [running, setRunning] = React.useState(false);
	const timerRef = React.useRef(null);

	React.useEffect(() => {
		// cleanup on unmount
		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
				timerRef.current = null;
			}
		};
	}, []);

	const startTimer = () => {
		if (timerRef.current) return; // already running
		setRunning(true);
		timerRef.current = setInterval(() => {
			setElapsed((e) => e + 1);
		}, 1000);
	};

	const pauseTimer = () => {
		setRunning(false);
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
	};

	const completeTimer = () => {
		// stop and reset
		pauseTimer();
		setElapsed(0);
	};

	const pad = (n) => String(n).padStart(2, "0");
	const h = Math.floor(elapsed / 3600);
	const m = Math.floor((elapsed % 3600) / 60);
	const s = elapsed % 60;

	const onStartFocus = async () => {
		startTimer();
		await trackEvent({
			type: "timer_start",
			path: window.location.pathname,
			element: "start-focus-button",
			metadata: { ms_since_session_start: msSinceSessionStart() },
		});
		console.log("timer_start sent");
	};

	const onCompleteFocus = async () => {
		completeTimer();
		await trackEvent({
			type: "timer_complete",
			path: window.location.pathname,
			element: "complete-focus-button",
		});
		console.log("timer_complete sent");
	};

	const onInterruptFocus = async () => {
		pauseTimer();
		await trackEvent({
			type: "timer_interrupt",
			path: window.location.pathname,
			element: "interrupt-focus-button",
		});
		console.log("timer_interrupt sent");
	};

	return (
		<div style={{ padding: 16 }}>
			<h2>Timer</h2>
			<p>
				<small>Simple controls for now — later we add a real countdown.</small>
			</p>

			<div style={{ marginBottom: 8 }}>
				<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
					<div style={{ fontSize: 28, fontFamily: "monospace" }}>{pad(h)}</div>
					<div style={{ fontSize: 20 }}>:</div>
					<div style={{ fontSize: 28, fontFamily: "monospace" }}>{pad(m)}</div>
					<div style={{ fontSize: 20 }}>:</div>
					<div style={{ fontSize: 28, fontFamily: "monospace" }}>{pad(s)}</div>
				</div>
				<div style={{ display: "flex", gap: 32, marginTop: 4 }}>
					<small>H</small>
					<small>M</small>
					<small>S</small>
					<div style={{ marginLeft: 16 }}>
						<small>{running ? "Running" : elapsed > 0 ? "Paused" : "Idle"}</small>
					</div>
				</div>
			</div>

			<div style={{ marginBottom: 16 }}>
				<button onClick={() => onStartFocus().catch(console.error)}>Start focus</button> <button onClick={() => onCompleteFocus().catch(console.error)}>Complete focus</button>{" "}
				<button onClick={() => onInterruptFocus().catch(console.error)}>Stop</button>
			</div>
		</div>
	);
}
