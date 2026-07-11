// 게임 애셋 제작 목록(JSON)을 과제 관리 DB에 '과제'로 등록하는 임포터
//
// 게임(axdata_01)의 "무엇을 만들어야 하는지" 목록을 이 과제 관리 시스템으로 옮겨,
// 제작 진행을 상태(대기/진행/완료)·우선순위·분류로 추적하기 위한 연결 다리다.
//
// 입력 JSON 형식 (배열):
//   [
//     { "title": "무협 kael 초상", "category": "아트", "priority": "high",
//       "description": "assets/char/wuxia/kael.png (512 투명)" },
//     ...
//   ]
//
// 사용법:
//   node scripts/import-asset-tasks.mjs <목록.json>
//
// 같은 제목의 과제가 이미 있으면 건너뛴다(중복 방지). 등록자는 운영자 계정.

import fs from 'node:fs';
import { getDb } from '../lib/db.js';

const PRIORITIES = ['low', 'medium', 'high'];

const file = process.argv[2];
if (!file) {
  console.error('사용법: node scripts/import-asset-tasks.mjs <목록.json>');
  process.exit(1);
}

let items;
try {
  items = JSON.parse(fs.readFileSync(file, 'utf8'));
} catch (e) {
  console.error(`JSON 읽기 실패: ${e.message}`);
  process.exit(1);
}
if (!Array.isArray(items)) {
  console.error('JSON 최상위는 배열이어야 합니다.');
  process.exit(1);
}

const db = getDb();
const creator = db.prepare("SELECT id FROM users WHERE role = 'operator' ORDER BY id LIMIT 1").get();
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
  insert.run(title, String(it.description || ''), priority, String(it.category || '아트'), creator ? creator.id : null);
  created++;
}

console.log(`과제 생성 ${created} · 중복 건너뜀 ${skipped}`);
