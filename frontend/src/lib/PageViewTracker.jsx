import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackEvent } from "./tracking.js";

export default function PageViewTracker() {
  const location = useLocation();
  const prevPathRef = useRef(null);

  useEffect(() => {
    const currentPath = location.pathname;
    const previousPath = prevPathRef.current;

    console.log("PAGE VIEW detected", {
      from: previousPath,
      to: currentPath,
    });

    trackEvent({
      type: "page_view",
      path: currentPath,
      element: "route",
      metadata: {
        from: previousPath,
      },
    })
      .then(() => {
        console.log("page_view sent to backend", {
          from: previousPath,
          to: currentPath,
        });
      })
      .catch((err) => {
        console.error("page_view failed", err);
      });

    prevPathRef.current = currentPath;
  }, [location.pathname]);

  return null;
}
