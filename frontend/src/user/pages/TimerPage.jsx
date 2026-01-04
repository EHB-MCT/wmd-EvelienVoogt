import React from "react";
import { trackEvent, msSinceSessionStart } from "../../lib/tracking";

export default function TimerPage() {
	const [elapsed, setElapsed] = React.useState(0); // seconds
	const [running, setRunning] = React.useState(false);
	const timerRef = React.useRef(null);
	const startedAtRef = React.useRef(null);

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
		// set starting point so we can compute ms precisely; when resuming, keep elapsed offset
		startedAtRef.current = Date.now() - elapsed * 1000;
		timerRef.current = setInterval(() => {
			// compute elapsed from startedAtRef for better accuracy
			setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
		}, 1000);
	};

	const pauseTimer = () => {
		setRunning(false);
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
		if (startedAtRef.current) {
			const durationMs = Date.now() - startedAtRef.current;
			setElapsed(Math.floor(durationMs / 1000));
			startedAtRef.current = null;
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

	const getDurationMs = () => {
		if (startedAtRef.current) {
			return Date.now() - startedAtRef.current;
		}
		return elapsed * 1000;
	};

	const onStartFocus = async () => {
		if (running) {
			console.log("start ignored: timer already running");
			return;
		}
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
		if (!running) {
			console.log("complete ignored: no timer running");
			return;
		}
		const durationMs = getDurationMs();
		completeTimer();
		await trackEvent({
			type: "timer_complete",
			path: window.location.pathname,
			element: "complete-focus-button",
			metadata: { duration_ms: durationMs },
		});
		console.log("timer_complete sent", { duration_ms: durationMs });
	};

	const onInterruptFocus = async () => {
		if (!running) {
			console.log("interrupt ignored: no timer running");
			return;
		}
		const durationMs = getDurationMs();
		pauseTimer();
		await trackEvent({
			type: "timer_interrupt",
			path: window.location.pathname,
			element: "interrupt-focus-button",
			metadata: { duration_ms: durationMs },
		});
		console.log("timer_interrupt sent", { duration_ms: durationMs });
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
				<button disabled={running} onClick={() => onStartFocus().catch(console.error)} title={running ? "Timer already running" : "Start focus"}>
					Start focus
				</button>{" "}
				<button disabled={!running} onClick={() => onCompleteFocus().catch(console.error)} title={!running ? "No timer running" : "Complete focus"}>
					Complete focus
				</button>{" "}
				<button disabled={!running} onClick={() => onInterruptFocus().catch(console.error)} title={!running ? "No timer running" : "Stop"}>
					Stop
				</button>
			</div>
		</div>
	);
}
