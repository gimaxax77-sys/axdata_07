// 애셋 과제 객체 배열을 과제 DB에 등록하는 공용 로직 (같은 제목은 건너뜀)
import { getDb } from '../lib/db.js';

const PRIORITIES = ['low', 'medium', 'high'];

// items: [{ title, description?, category?, priority? }]
// 반환: { created, skipped }  — 같은 제목의 과제가 이미 있으면 skipped.
export function importAssetTasks(items) {
  const db = getDb();
  const creator = db
    .prepare("SELECT id FROM users WHERE role = 'operator' ORDER BY id LIMIT 1")
    .get();
  const exists = db.prepare('SELECT 1 FROM tasks WHERE title = ?');
  const insert = db.prepare(
    `INSERT INTO tasks (title, description, status, priority, category, created_by)
     VALUES (?, ?, 'todo', ?, ?, ?)`
  );

  let created = 0;
  let skipped = 0;
  for (const it of items) {
    const title = String(it.title || '').trim();
    if (!title) continue;
    if (exists.get(title)) {
      skipped++;
      continue;
    }
    const priority = PRIORITIES.includes(it.priority) ? it.priority : 'medium';
    insert.run(
      title,
      String(it.description || ''),
      priority,
      String(it.category || '아트'),
      creator ? creator.id : null
    );
    created++;
  }
  return { created, skipped };
}
