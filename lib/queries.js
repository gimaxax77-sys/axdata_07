import { getDb } from "@/lib/db";

// ---------------- Users ----------------

export function listUsers() {
  return getDb()
    .prepare("SELECT id, username, name, role, created_at FROM users ORDER BY id")
    .all();
}

export function getUserById(id) {
  return getDb()
    .prepare("SELECT id, username, name, role, created_at FROM users WHERE id = ?")
    .get(id);
}

export function getUserByUsername(username) {
  return getDb().prepare("SELECT * FROM users WHERE username = ?").get(username);
}

export function createUser({ username, name, passwordHash, role }) {
  return getDb()
    .prepare(
      "INSERT INTO users (username, name, password_hash, role) VALUES (?, ?, ?, ?)"
    )
    .run(username, name, passwordHash, role);
}

export function updateUserRole(id, role) {
  getDb().prepare("UPDATE users SET role = ? WHERE id = ?").run(role, id);
}

export function deleteUser(id) {
  getDb().prepare("DELETE FROM users WHERE id = ?").run(id);
}

export function countOperators() {
  return getDb()
    .prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'operator'")
    .get().n;
}

// ---------------- Tasks ----------------

const TASK_SELECT = `
  SELECT t.*,
         a.name AS assignee_name,
         c.name AS creator_name
    FROM tasks t
    LEFT JOIN users a ON a.id = t.assignee_id
    LEFT JOIN users c ON c.id = t.created_by
`;

export function listTasks(filters = {}) {
  const where = [];
  const params = [];
  if (filters.status) {
    where.push("t.status = ?");
    params.push(filters.status);
  }
  if (filters.priority) {
    where.push("t.priority = ?");
    params.push(filters.priority);
  }
  if (filters.assignee_id) {
    where.push("t.assignee_id = ?");
    params.push(Number(filters.assignee_id));
  }
  if (filters.q) {
    where.push("(t.title LIKE ? OR t.description LIKE ? OR t.category LIKE ?)");
    const like = `%${filters.q}%`;
    params.push(like, like, like);
  }
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const order = `
    ORDER BY
      CASE t.status WHEN 'in_progress' THEN 0 WHEN 'todo' THEN 1 ELSE 2 END,
      CASE t.priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
      (t.due_date IS NULL), t.due_date ASC, t.id DESC
  `;
  return getDb().prepare(`${TASK_SELECT} ${clause} ${order}`).all(...params);
}

export function getTask(id) {
  const task = getDb().prepare(`${TASK_SELECT} WHERE t.id = ?`).get(id);
  if (!task) return null;
  task.links = getDb()
    .prepare("SELECT id, label, url, kind FROM task_links WHERE task_id = ? ORDER BY id")
    .all(id);
  return task;
}

export function createTask(data) {
  const db = getDb();
  const info = db
    .prepare(
      `INSERT INTO tasks (title, description, status, priority, category, due_date, assignee_id, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      data.title,
      data.description ?? "",
      data.status ?? "todo",
      data.priority ?? "medium",
      data.category ?? "",
      data.due_date || null,
      data.assignee_id || null,
      data.created_by || null
    );
  return info.lastInsertRowid;
}

export function updateTask(id, data) {
  getDb()
    .prepare(
      `UPDATE tasks
          SET title = ?, description = ?, status = ?, priority = ?,
              category = ?, due_date = ?, assignee_id = ?,
              updated_at = datetime('now')
        WHERE id = ?`
    )
    .run(
      data.title,
      data.description ?? "",
      data.status ?? "todo",
      data.priority ?? "medium",
      data.category ?? "",
      data.due_date || null,
      data.assignee_id || null,
      id
    );
}

export function deleteTask(id) {
  getDb().prepare("DELETE FROM tasks WHERE id = ?").run(id);
}

export function addTaskLink(taskId, { label, url, kind = "link" }) {
  getDb()
    .prepare("INSERT INTO task_links (task_id, label, url, kind) VALUES (?, ?, ?, ?)")
    .run(taskId, label ?? "", url, kind);
}

export function deleteTaskLink(id, taskId) {
  getDb()
    .prepare("DELETE FROM task_links WHERE id = ? AND task_id = ?")
    .run(id, taskId);
}

export function replaceTaskLinks(taskId, links) {
  const db = getDb();
  db.prepare("DELETE FROM task_links WHERE task_id = ? AND kind = 'link'").run(taskId);
  const stmt = db.prepare(
    "INSERT INTO task_links (task_id, label, url, kind) VALUES (?, ?, ?, 'link')"
  );
  for (const l of links) {
    if (l.url) stmt.run(taskId, l.label ?? "", l.url);
  }
}

export function taskStats() {
  const db = getDb();
  const byStatus = db
    .prepare("SELECT status, COUNT(*) AS n FROM tasks GROUP BY status")
    .all();
  const total = db.prepare("SELECT COUNT(*) AS n FROM tasks").get().n;
  const overdue = db
    .prepare(
      "SELECT COUNT(*) AS n FROM tasks WHERE status != 'done' AND due_date IS NOT NULL AND due_date < date('now')"
    )
    .get().n;
  const map = { todo: 0, in_progress: 0, done: 0 };
  for (const r of byStatus) map[r.status] = r.n;
  return { total, overdue, ...map };
}
