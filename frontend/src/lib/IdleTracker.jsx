import { useEffect, useRef } from "react";
import { trackEvent } from "./tracking.js";

export default function IdleTracker({ idleMs = 30000 }) {
  const idleTimerRef = useRef(null);
  const idleStartedAtRef = useRef(null);

  useEffect(() => {
    const scheduleIdleStart = () => {
      // reset timer
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

      idleTimerRef.current = setTimeout(async () => {
        // already idle -> do nothing
        if (idleStartedAtRef.current) return;

        idleStartedAtRef.current = Date.now();
        console.log("IDLE START detected", {
          path: window.location.pathname,
          idleMs,
        });

        try {
          await trackEvent({
            type: "idle_start",
            path: window.location.pathname,
            element: "idle-tracker",
            metadata: { idle_threshold_ms: idleMs },
          });
          console.log("idle_start sent");
        } catch (e) {
          console.error("idle_start failed", e);
        }
      }, idleMs);
    };

    const onActivity = async (evt) => {
      // If we were idle, end it
      if (idleStartedAtRef.current) {
        const endedAt = Date.now();
        const duration_ms = endedAt - idleStartedAtRef.current;

        console.log("IDLE END detected", {
          path: window.location.pathname,
          duration_ms,
          event: evt?.type,
        });

        idleStartedAtRef.current = null;

        try {
          await trackEvent({
            type: "idle_end",
            path: window.location.pathname,
            element: "idle-tracker",
            duration_ms,
            metadata: { activity: evt?.type ?? null },
          });
          console.log("idle_end sent", { duration_ms });
        } catch (e) {
          console.error("idle_end failed", e);
        }
      }

      // Always reschedule idle timer on any activity
      scheduleIdleStart();
    };

    // events that count as "activity"
    const activityEvents = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    activityEvents.forEach((name) =>
      window.addEventListener(name, onActivity, { passive: true })
    );

    // start the initial timer
    scheduleIdleStart();

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      activityEvents.forEach((name) =>
        window.removeEventListener(name, onActivity)
      );
    };
  }, [idleMs]);

  return null;
}
