// 게임(axdata_01) 로스터를 읽어, 아직 아트가 없는 캐릭터 초상만 골라 과제로 등록
//
// 코어시스템(system/concepts)의 캐릭터 로스터가 "무슨 초상이 필요한지"의 원본이고,
// 아트팩(assets/char/<concept>/<id>.png)이 "실제로 만들어진 것"이다. 둘을 대조해
// 아직 파일이 없는 초상만 아트 과제로 만들어 과제 DB에 바로 등록하는 연결 다리다.
//
// 사용법:
//   node scripts/gen-asset-tasks.mjs [axdata_01경로]     (기본: ../axdata_01)
//
// 같은 제목의 과제가 이미 있으면 건너뛴다(중복 방지). 등록자는 운영자 계정.

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { importAssetTasks } from './task-import.mjs';

const CONCEPT_LABEL = { fantasy: '판타지', scifi: 'SF' };
// 등급 → 우선순위: 고등급 캐릭터 초상을 먼저 만들도록 우선순위를 높인다.
const RARITY_PRIORITY = { UR: 'high', SSR: 'high', SR: 'medium', R: 'low', N: 'low' };

const gameRoot = path.resolve(process.argv[2] || '../axdata_01');
const conceptsEntry = path.join(gameRoot, 'system', 'concepts', 'index.mjs');
if (!fs.existsSync(conceptsEntry)) {
  console.error(`게임 코어를 찾지 못했습니다: ${conceptsEntry}`);
  console.error('사용법: node scripts/gen-asset-tasks.mjs [axdata_01경로]  (기본: ../axdata_01)');
  process.exit(1);
}

const { CONCEPTS } = await import(pathToFileURL(conceptsEntry).href);

const items = [];
let have = 0;
for (const [conceptId, concept] of Object.entries(CONCEPTS)) {
  const label = CONCEPT_LABEL[conceptId] || conceptId;
  for (const ch of concept.roster || []) {
    const rel = `assets/char/${conceptId}/${ch.id}.png`;
    if (fs.existsSync(path.join(gameRoot, rel))) {
      have++;
      continue;
    }
    items.push({
      title: `${label} ${ch.name}(${ch.id}) 초상`,
      category: '아트',
      priority: RARITY_PRIORITY[ch.rarity] || 'medium',
      description: `${rel} · 512×512 투명 PNG · ${ch.title}(${ch.rarity}) · ${label} 로스터`,
    });
  }
}

const { created, skipped } = importAssetTasks(items);
console.log(`로스터 초상 점검 — 이미 있음 ${have} · 부족 ${items.length}`);
console.log(`과제 생성 ${created} · 중복 건너뜀 ${skipped}`);
