export const IDLE_TIMEOUT = 30 * 60 * 1000;
const ACTIVITY_KEY = "sadya.lastActivity";
const SESSION_EVENT = "sadya:logout";

export function recordActivity() {
  localStorage.setItem(ACTIVITY_KEY, String(Date.now()));
}

export function isSessionIdle() {
  const last = Number(localStorage.getItem(ACTIVITY_KEY));
  return last > 0 && Date.now() - last >= IDLE_TIMEOUT;
}

export function endSession(reason = "") {
  const token = localStorage.getItem("token");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem(ACTIVITY_KEY);
  if (reason) sessionStorage.setItem("sadya.logoutReason", reason);
  window.dispatchEvent(new Event(SESSION_EVENT));
  if (token) {
    const base = import.meta.env?.VITE_API_URL || "http://127.0.0.1:8000/api";
    // Clear the screen immediately, even when the API is unavailable.
    void fetch(`${base}/logout`, {
      method: "POST",
      headers: {Accept: "application/json", Authorization: `Bearer ${token}`},
      keepalive: true,
    }).catch(() => {});
  }
}

export function watchSession(onLogout) {
  let timer;
  const expire = () => endSession("You were signed out after 30 minutes of inactivity. Please sign in again.");
  const check = () => {
    clearTimeout(timer);
    if (!localStorage.getItem("token")) { onLogout(); return false; }
    if (isSessionIdle()) { expire(); return false; }
    if (!localStorage.getItem(ACTIVITY_KEY)) recordActivity();
    const remaining = IDLE_TIMEOUT - (Date.now() - Number(localStorage.getItem(ACTIVITY_KEY)));
    timer = setTimeout(check, Math.max(1, remaining));
    return true;
  };
  const activity = () => {
    // Check before resetting so resuming an expired tab cannot revive it.
    if (document.visibilityState === "hidden" || !check()) return;
    recordActivity();
    check();
  };
  const events = ["pointerdown", "pointermove", "keydown", "scroll", "touchstart"];
  for (const event of events) window.addEventListener(event, activity, {passive: true, capture: true});
  window.addEventListener("focus", check);
  window.addEventListener("pageshow", check);
  document.addEventListener("visibilitychange", check);
  window.addEventListener("storage", check);
  window.addEventListener(SESSION_EVENT, onLogout);
  check();
  return () => {
    clearTimeout(timer);
    for (const event of events) window.removeEventListener(event, activity, {capture: true});
    window.removeEventListener("focus", check);
    window.removeEventListener("pageshow", check);
    document.removeEventListener("visibilitychange", check);
    window.removeEventListener("storage", check);
    window.removeEventListener(SESSION_EVENT, onLogout);
  };
}
