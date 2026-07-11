// Seeds the database with an initial operator account (and a sample manager +
// a couple of demo tasks). Safe to re-run: it skips anything that already exists.
//
//   npm run seed
//
// Default credentials (change the password after first login!):
//   operator / admin1234   (운영자)
//   manager  / manager1234 (매니저)

import { getDb } from "../lib/db.js";
import { hashPassword } from "../lib/password.js";

const db = getDb();

function ensureUser({ username, name, password, role }) {
  const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
  if (existing) {
    console.log(`• 사용자 '${username}' 이미 존재 — 건너뜀`);
    return existing.id;
  }
  const info = db
    .prepare(
      "INSERT INTO users (username, name, password_hash, role) VALUES (?, ?, ?, ?)"
    )
    .run(username, name, hashPassword(password), role);
  console.log(`✓ 사용자 '${username}' (${role}) 생성`);
  return info.lastInsertRowid;
}

const operatorId = ensureUser({
  username: "operator",
  name: "운영자",
  password: "admin1234",
  role: "operator",
});

const managerId = ensureUser({
  username: "manager",
  name: "김매니저",
  password: "manager1234",
  role: "manager",
});

const taskCount = db.prepare("SELECT COUNT(*) AS n FROM tasks").get().n;
if (taskCount === 0) {
  const insert = db.prepare(
    `INSERT INTO tasks (title, description, status, priority, category, due_date, assignee_id, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  insert.run(
    "로그인 화면 디자인",
    "운영자/매니저 로그인 UI 시안 작업",
    "in_progress",
    "high",
    "디자인",
    "2026-07-20",
    managerId,
    operatorId
  );
  insert.run(
    "DB 백업 자동화",
    "매일 SQLite 파일 백업 스크립트 작성",
    "todo",
    "medium",
    "인프라",
    "2026-07-25",
    operatorId,
    operatorId
  );
  console.log("✓ 예시 과제 2건 생성");
} else {
  console.log(`• 과제 ${taskCount}건 존재 — 예시 데이터 건너뜀`);
}

console.log("\n완료! 다음 계정으로 로그인하세요:");
console.log("  운영자:  operator / admin1234");
console.log("  매니저:  manager  / manager1234");
