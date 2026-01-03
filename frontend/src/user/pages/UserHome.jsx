import React from "react";
import { trackEvent } from "../../lib/tracking.js";

export default function UserHome() {
  const onStartFocus = async () => {
    try {
      await trackEvent({
        type: "timer_start",
        path: window.location.pathname,
        element: "start-focus-button",
      });
      alert("timer_start logged");
    } catch (e) {
      console.error(e);
      alert("Failed to log timer_start (check console)");
    }
  };

  return (
    <div>
      <h2>User app</h2>
      <button onClick={onStartFocus}>Start focus</button>
    </div>
  );
}