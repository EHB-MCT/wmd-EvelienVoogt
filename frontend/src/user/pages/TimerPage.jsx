import React from "react";
import { trackEvent, msSinceSessionStart } from "../../lib/tracking";

export default function TimerPage() {
  const onStartFocus = async () => {
    await trackEvent({
      type: "timer_start",
      path: window.location.pathname,
      element: "start-focus-button",
      metadata: { ms_since_session_start: msSinceSessionStart() },
    });
    console.log("timer_start sent");
  };

  const onCompleteFocus = async () => {
    await trackEvent({
      type: "timer_complete",
      path: window.location.pathname,
      element: "complete-focus-button",
    });
    console.log("timer_complete sent");
  };

  const onInterruptFocus = async () => {
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

      <div style={{ marginBottom: 16 }}>
        <button onClick={() => onStartFocus().catch(console.error)}>Start focus</button>{" "}
        <button onClick={() => onCompleteFocus().catch(console.error)}>Complete focus</button>{" "}
        <button onClick={() => onInterruptFocus().catch(console.error)}>Stop</button>
      </div>
    </div>
  );
}
