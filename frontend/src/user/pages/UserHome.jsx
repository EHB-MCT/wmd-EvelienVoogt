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
      alert("Failed to log timer_start");
    }
  };

  const onCompleteFocus = async () => {
    try {
      await trackEvent({
        type: "timer_complete",
        path: window.location.pathname,
        element: "complete-focus-button",
      });
      alert("timer_complete logged");
    } catch (e) {
      console.error(e);
      alert("Failed to log timer_complete");
    }
  };

  const onInterruptFocus = async () => {
  try {
    await trackEvent({
      type: "timer_interrupt",
      path: window.location.pathname,
      element: "interrupt-focus-button",
    });
    alert("timer_interrupt logged");
  } catch (e) {
    console.error(e);
    alert("Failed to log timer_interrupt");
  }
};

  return (
    <div>
      <h2>User app</h2>
      <button onClick={onStartFocus}>Start focus</button>{" "}
      <button onClick={onCompleteFocus}>Complete focus</button>
      <button onClick={onInterruptFocus}>Interrupt focus</button>
    </div>
  );
}