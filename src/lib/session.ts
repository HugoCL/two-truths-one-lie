const SESSION_KEY = "ttol_session_id";

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) {
    return existing;
  }

  const sessionId = crypto.randomUUID();
  localStorage.setItem(SESSION_KEY, sessionId);
  return sessionId;
}
