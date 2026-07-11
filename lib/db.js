import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

// Single shared connection across the app (Next dev may re-import modules, so
// we stash it on globalThis to avoid opening the DB multiple times).
const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "app.db");

function createConnection() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  migrate(db);
  return db;
}

function migrate(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT NOT NULL UNIQUE,
      name          TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role          TEXT NOT NULL DEFAULT 'manager', -- 'operator' | 'manager'
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token      TEXT PRIMARY KEY,
      user_id    INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      status      TEXT NOT NULL DEFAULT 'todo',    -- todo | in_progress | done
      priority    TEXT NOT NULL DEFAULT 'medium',  -- low | medium | high
      category    TEXT NOT NULL DEFAULT '',
      due_date    TEXT,                            -- YYYY-MM-DD or null
      assignee_id INTEGER,
      created_by  INTEGER,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by)  REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS task_links (
      id      INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      label   TEXT NOT NULL DEFAULT '',
      url     TEXT NOT NULL,
      kind    TEXT NOT NULL DEFAULT 'link',        -- link | file
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_status   ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
    CREATE INDEX IF NOT EXISTS idx_links_task     ON task_links(task_id);
  `);
}

/** @returns {import('node:sqlite').DatabaseSync} */
export function getDb() {
  if (!globalThis.__taskAdminDb) {
    globalThis.__taskAdminDb = createConnection();
  }
  return globalThis.__taskAdminDb;
}
