# research.md — 작업·조사 기록

> CLAUDE.md 규칙: 모든 질문·요구·요청과 진행 과정·결과를 신중·깊이·상세·명확·정확하게 정리해 여기에 누적 기록한다.

## 기록 형식
- **날짜 — 제목**
  - 요청:
  - 진행:
  - 결정·근거:
  - 결과:

---

## 2026-07-13 — CLAUDE.md 규칙 추가 및 전 저장소 횡전개
- 요청: CLAUDE.md에 "모든 답변을 신중·깊이·상세·명확·정확하게 정리하고 research.md에 기록" 규칙 추가, 전 저장소 기본 브랜치에 횡전개.
- 진행: 7개 저장소(axax77, axdata_01/03/05/07/09, gax)의 기본 브랜치 CLAUDE.md에 "답변·기록 규칙" 섹션 추가, 각 저장소에 research.md 생성.
- 결정·근거: '횡전개' = 새 세션이 실제로 여는 기본 브랜치에 반영(ponytail 배포와 동일 기준). 기존 CLAUDE.md는 보존하고 규칙 섹션만 추가(수술적 변경).
- 결과: 각 저장소 커밋·푸시 완료(아래 커밋 참조).

## 2026-07-13 — 로스터→아트팩 자동 연결 (코어시스템↔아트팩 다리)
- 요청: axdata_07(과제관리, Next.js + node:sqlite) 이어서, "실제 코어시스템과 아트팩 연결" 작업.
- 진행:
  - 게임(axdata_01)을 세션에 추가해 구조 파악. 코어시스템 = `system/concepts`의 캐릭터 로스터(fantasy·scifi 각 33명, 합 66 초상 필요), 아트팩 = `assets/char/<concept>/<id>.png`(있으면 `app/charImages.js` 한 줄 등록, 없으면 이모지 폴백).
  - 실제 상태 대조: 이미 등록 28장, 로스터엔 있으나 아트 없는 부족분 38장(19명×2컨셉).
  - axdata_07에 `scripts/gen-asset-tasks.mjs` 추가: axdata_01 경로를 받아 로스터를 동적 import하고, 파일 없는 초상만 골라 과제 DB에 바로 등록(등급→우선순위, 중복 제목 건너뜀). 공용 등록 로직은 `scripts/task-import.mjs`로 분리하고 기존 `import-asset-tasks.mjs`도 이를 쓰도록 정리.
- 결정·근거: axdata_01은 읽기만(내 push 지정 브랜치는 axdata_07뿐). 자동 도출은 데이터로 확정 가능한 캐릭터 초상으로 한정(BGM/배경은 데이터로 열거 불가). Gim이 "자동 생성 + 바로 등록" 선택.
- 결과: 시드→생성 실행 시 "이미 있음 28·부족 38", 과제 38개 생성·재실행 시 38개 중복 건너뜀(멱등) 확인. 커밋 `ba86332` push.

## 2026-07-13 — 과제 상세 아트 이미지 업로드 통로
- 요청: 게임팩이 요구하는 아트 파일을 다리(과제관리)를 통해 전달. 과제관리 페이지에 업로드 폴더/경로가 있는지 확인 후 파일 업로드 방식으로 구현. (또한 axdata_01에 만들었던 플레이스홀더 초상은 폐기.)
- 진행:
  - 현황 확인: `public/uploads/`는 빈 폴더(.gitkeep)만 있고 업로드 기능 미구현, 기존엔 URL 링크만 가능(TaskForm이 kind='file'을 오히려 숨김). axdata_01 플레이스홀더(gen-portraits로 만든 66장 중 신규 38장)는 git clean으로 폐기(게임 저장소 변경 0).
  - `app/tasks/actions.js`에 `uploadFileAction`/`deleteFileAction` 추가(이미지 타입·8MB 검증, 파일명 안전화로 경로탈출 방지, kind='file' 링크 기록). 상세 화면에 썸네일·다운로드·삭제 UI + 업로드 폼(에러 안내).
  - 검증 중 발견한 버그: `next start`(프로덕션)는 빌드 이후 추가된 `public/` 파일을 정적 서빙하지 않아 업로드 이미지가 404. → `app/uploads/[name]/route.js`로 디스크에서 직접 읽어 서빙(dev·prod 모두 동작). 런타임 추가 파일 200 image/png 확인.
- 결정·근거: 저장은 문서화된 `public/uploads/` 유지(.gitignore가 이미 제외), 서빙만 라우트로 우회(수술적). 업로드 POST 자동구동은 테스트도구의 sameSite=lax 쿠키 제약으로 막히나, 기존 setStatusAction도 동일하게 겪는 하네스 한계라 코드 결함 아님(액션이 파일 745,377바이트 정상 수신 로그로 확인).
- 결과: next build 성공, 썸네일 표시·이미지 서빙(200)·다운로드·삭제 E2E 통과. 커밋 `e254d54` push.
- 다음 후보(대기): 게임팩 자동 적용 스크립트(업로드분→게임 경로 복사 + charImages.js 자동 재생성). axdata_01 수정이라 push 허락·브랜치 필요.

## 2026-07-15 — 아트 파이프라인 전체 구조 분석 (게임팩·아트팩·과제관리)
- 요청: "게임팩 자동 적용 스크립트"가 겹치는지 확인 → 더 깊게 읽고 초보자 수준으로 설명.
- 진행:
  - axdata_01 `claude/art-asset-bridge` 브랜치(=main보다 30+커밋 앞선 실질 작업선)를 읽음. 이미 `scripts/sync-art.mjs`(초상)·`scripts/sync-sprites.mjs`(전투 스프라이트)가 존재. 둘 다 "로스터에서 없는 것만 골라 → 아트 스튜디오(axdata_09) API로 생성·회수 → 게임 규격 경로 저장 → charImages.js/unitSprites.js 레지스트리 재생성". npm: `sync-art`, `sync-sprites`, `gen:portraits`. 문서: `docs/ART_BIBLE.md`(캐릭터 제작 명세·프롬프트), `docs/ART_PIPELINE_3D.md`.
  - axdata_09(아트 스튜디오)를 세션에 추가해 읽음. Python FastAPI 웹앱 "AXData Studio", `http://127.0.0.1:8000`(Windows는 start.bat→_hidden.vbs로 백그라운드). GPT(기획)+Gemini(Nano Banana)/OpenAI gpt-image-1(아트). 키 없으면 Pillow 플레이스홀더 = 데모모드(무비용 배관검증). 26종 아트요소·캐릭터시트·스프라이트시트·VFX·CapCut영상. API: `POST /api/generate`(GenerationRequest→assets[{kind,path,demo}]), `GET /files/{path}`, `/api/generate_batch`(도감 일괄).
- 결정·근거: "아트팩→게임팩 자동 적용"은 이미 완성(sync-art). 새 apply 스크립트는 중복이고 charImages.js 이중수정 충돌 위험 → 만들지 않음. Gim의 루틴과 실제 매핑: 명세서=ART_BIBLE, 아트생성=axdata_09, 게임적용=sync-art/sprites, 사람작업 추적·업로드=axdata_07.
- 결과: 저장소 4개 역할 확정. 사람이 과제관리에 올린 아트를 게임에 넣으려면 새 스크립트 없이 "업로드→게임 규격 경로 복사"만 하고 기존 `sync-art --map-only`로 등록하면 됨(대기 옵션).

## 2026-07-15 — "선택형 질문(체크박스)" 규칙 전 저장소 전개
- 요청: 의사결정·복수 선택지는 항상 선택형(체크박스) 질문으로 띄우는 규칙을 전 저장소에 전개.
- 진행: 각 저장소 CLAUDE.md 소통 규칙 감사 후 없는 곳만 보강(수술적).
  - 이미 있음: axdata_01(6번)·axdata_09(5번)·axdata_05(5번).
  - 추가함: axdata_07(소통 규칙 5번, 이 작업 브랜치) · axdata_03(main) · axax77(main).
  - 제외: gax(CLAUDE.md 형식이 달라 소통 규칙 섹션 자체가 없음 — Gim 결정으로 제외).
- 결정·근거: 저장소마다 CLAUDE.md가 달라 동일 문구 일괄삽입 대신 "감사 후 없는 곳만" 추가. 게임 계열만 대상, gax 제외(Gim 선택).
- 결과: 게임 계열 전원 규칙 보유. axdata_07은 작업 브랜치 + 기본 브랜치(claude/task-management-admin-ury4d0, worktree로 규칙 한 줄만 직접 push) 모두 반영 완료(Gim 허락). gax만 제외.
