import React from "react";
import { trackEvent, msSinceSessionStart } from "../../lib/tracking";
import { createProfileManager } from "../../lib/profileManager.js";

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

	const mgrRef = React.useRef(null);

	const [labels, setLabels] = React.useState([]);
	const [tip, setTip] = React.useState("");
	const [profileError, setProfileError] = React.useState("");
	const [profileLoading, setProfileLoading] = React.useState(false);

	React.useEffect(() => {
		mgrRef.current = createProfileManager();

		async function loadProfile() {
			try {
				setProfileLoading(true);
				setProfileError("");

				await mgrRef.current.load();

				const nextLabels = mgrRef.current.getLabels();
				setLabels(nextLabels);

				setTip(mgrRef.current.pickTip());
			} catch (e) {
				setProfileError(e.message || "Failed to load profile");
				setLabels([]);
				setTip("");
			} finally {
				setProfileLoading(false);
			}
		}

		loadProfile().catch(console.error);
	}, []);

	return (
		<div className="page-content">
			<h2>Timer</h2>
			{tip && (
				<div className="hint-banner">
					<small>{tip}</small>
				</div>
			)}

			<div className="timer-block" style={{ marginBottom: 8 }}>
				<div className="timer-display">
					<div className="time-segment">
						<div className="time-value">{pad(h)}</div>
						<div className="time-label">H</div>
					</div>
					<div className="colon">:</div>
					<div className="time-segment">
						<div className="time-value">{pad(m)}</div>
						<div className="time-label">M</div>
					</div>
					<div className="colon">:</div>
					<div className="time-segment">
						<div className="time-value">{pad(s)}</div>
						<div className="time-label">S</div>
					</div>
					<div className="timer-status" style={{ marginLeft: 16 }}>
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
