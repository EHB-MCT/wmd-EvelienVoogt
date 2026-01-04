// Central policy for when the user-frontend should re-fetch the session profile.

export const PROFILE_REFRESH_CONFIG = {
  cooldownMs: 30_000,          // min time between refreshes
  longIdleThresholdMs: 60_000, // only refresh on idle_end if >= 60s
  fallbackIntervalMs: 180_000, // 3 min (set null/0 to disable)
  refreshRoutes: ["/timer", "/tasks"], // only refresh on page_view for these routes
};

export function shouldReloadProfile(eventType, payload = {}, config = PROFILE_REFRESH_CONFIG) {
  // Key action events
  if (eventType === "timer_complete") return true;
  if (eventType === "timer_interrupt") return true;

  // Tasks: keep signal high, avoid noise
  if (eventType === "task_complete") return true;
  if (eventType === "task_delete") return true;

  // Navigation: only for relevant routes
  if (eventType === "page_view") {
    const path = payload?.path ?? payload?.to ?? window.location.pathname;
    return config.refreshRoutes.includes(path);
  }

  // Attention: only long idle ends
  if (eventType === "idle_end") {
    const d = payload?.duration_ms;
    return typeof d === "number" && d >= config.longIdleThresholdMs;
  }

  return false;
}

/**
 * Creates a refresh manager with cooldown + optional fallback interval.
 */
export function createProfileRefreshManager(reloadProfile, config = PROFILE_REFRESH_CONFIG) {
  let lastReloadAt = 0;
  let fallbackTimer = null;

  async function tryReload(reason, payload) {
    const now = Date.now();
    if (now - lastReloadAt < config.cooldownMs) return false;

    lastReloadAt = now;
    await reloadProfile();
    return true;
  }

  async function handleEvent(eventType, payload = {}) {
    if (shouldReloadProfile(eventType, payload, config)) {
      return tryReload(eventType, payload);
    }
    return false;
  }

  function startFallback(isUserActiveFn = () => true) {
    const interval = config.fallbackIntervalMs;
    if (!interval) return;
    stopFallback();

    fallbackTimer = setInterval(async () => {
      try {
        if (!isUserActiveFn()) return;
        await tryReload("fallback_timer", {});
      } catch (e) {
        console.warn("fallback profile reload failed", e);
      }
    }, interval);
  }

  function stopFallback() {
    if (fallbackTimer) clearInterval(fallbackTimer);
    fallbackTimer = null;
  }

  return {
    handleEvent,
    tryReload,
    startFallback,
    stopFallback,
  };
}
