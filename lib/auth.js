import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

export { hashPassword, verifyPassword } from "@/lib/password";

const SESSION_COOKIE = "task_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

// ---- Sessions ----

export function createSession(userId) {
  const db = getDb();
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  db.prepare(
    "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)"
  ).run(token, userId, expires);
  return { token, expires };
}

export function destroySession(token) {
  if (!token) return;
  getDb().prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

/**
 * Reads the session cookie and returns the logged-in user, or null.
 * Safe to call from server components, route handlers, and server actions.
 */
export async function getCurrentUser() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const db = getDb();
  const row = db
    .prepare(
      `SELECT u.id, u.username, u.name, u.role, s.expires_at, s.token
         FROM sessions s
         JOIN users u ON u.id = s.user_id
        WHERE s.token = ?`
    )
    .get(token);

  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    destroySession(token);
    return null;
  }
  return { id: row.id, username: row.username, name: row.name, role: row.role };
}

export async function setSessionCookie(token, expires) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(expires),
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  destroySession(token);
  store.delete(SESSION_COOKIE);
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;

export function isOperator(user) {
  return user?.role === "operator";
}
