# 과제 관리 시스템 (Task Admin)

운영자(operator)와 매니저(manager) 권한으로 과제를 등록·배정·추적하는 웹 시스템입니다.
**Next.js (App Router) + SQLite(`node:sqlite`)** 로 구현되어 별도의 DB 서버나 네이티브 패키지 없이 동작합니다.

## 주요 기능

- **로그인 / 세션** — scrypt 비밀번호 해싱, HttpOnly 쿠키 기반 세션(7일)
- **권한 2단계**
  - **운영자(operator)**: 모든 과제 관리 + **사용자 계정 관리**(생성/권한변경/삭제)
  - **매니저(manager)**: 모든 과제 조회·등록·수정·삭제 (사용자 관리는 불가)
- **과제 관리**
  - 기본 정보: 제목, 설명, 상태(대기/진행중/완료), 마감일
  - 담당자 배정, 우선순위(높음/보통/낮음), 분류·태그
  - 링크(URL) 여러 개 + **이미지 파일 업로드**(아트 파일 전달용)
- **대시보드**: 상태별 통계·기한 초과 집계, 검색 및 상태/우선순위/담당자 필터
- **상태 빠른 변경**: 상세 화면에서 한 번에 상태 전환

## 빠른 시작

```bash
npm install        # 의존성 설치 (next, react)
npm run seed       # DB 생성 + 초기 계정/예시 과제 시드
npm run dev        # 개발 서버 (http://localhost:3000)
# 또는
npm run build && npm start
```

### 초기 계정 (최초 로그인 후 비밀번호 변경 권장)

| 권한   | 아이디     | 비밀번호       |
| ------ | ---------- | -------------- |
| 운영자 | `operator` | `admin1234`    |
| 매니저 | `manager`  | `manager1234`  |

## 윈도우에서 실행 (더블클릭)

`과제관리-실행.bat` 을 더블클릭하면 됩니다. 시작할 때 git 버전·상태를 확인하고 자동으로 `git pull` 한 뒤 개발 서버를 띄웁니다.

## 애셋 임포터 (게임 제작 목록 → 과제)

게임(`axdata_01_eldria`)의 "만들어야 할 애셋 목록(JSON)"을 이 과제 관리 시스템에 과제로 자동 등록하는 연결 다리입니다.

```bash
node scripts/import-asset-tasks.mjs <목록.json>
```

입력 JSON은 객체 배열이며, 같은 제목의 과제가 이미 있으면 건너뜁니다(중복 방지). 등록자는 운영자 계정입니다.

```json
[
  { "title": "무협 kael 초상", "category": "아트", "priority": "high",
    "description": "assets/char/wuxia/kael.png (512 투명)" }
]
```

### 로스터 자동 연결 (코어시스템 → 아트팩 → 과제)

목록을 손으로 쓰지 않고, 게임 코어시스템의 **캐릭터 로스터**에서 아직 아트가 없는
초상만 자동으로 뽑아 과제로 바로 등록합니다. 게임 폴더(`axdata_01_eldria`)를 옆에 두고 실행합니다.

```bash
node scripts/gen-asset-tasks.mjs [게임경로]   # 기본값: ../axdata_01_eldria
```

동작 방식은 이렇습니다.

- 코어시스템(`system/concepts`)의 로스터가 "어떤 초상이 필요한지"의 원본입니다(컨셉 `fantasy`·`scifi` 각각).
- 아트팩(`assets/char/<컨셉>/<id>.png`)에 파일이 있으면 "완성"으로 봅니다.
- 로스터엔 있는데 아트팩엔 없는 초상만 골라, 등급(UR·SSR→높음, SR→보통, R·N→낮음)을
  우선순위로 매겨 과제로 등록합니다. 같은 제목은 건너뜁니다(중복 방지).

```
로스터 초상 점검 — 이미 있음 28 · 부족 38
과제 생성 38 · 중복 건너뜀 0
```

## 프로젝트 구조

```
app/
  page.js                 대시보드 (과제 목록·통계·필터)
  login/                  로그인 화면 + 인증 서버 액션
  logout/route.js         로그아웃
  uploads/[name]/route.js 업로드 첨부 파일 서빙(런타임 파일도 prod 서빙)
  tasks/
    actions.js            과제 생성/수정/삭제/상태변경/파일첨부 서버 액션
    TaskForm.js           과제 입력 폼(신규·수정 공용)
    new/                  새 과제 등록
    [id]/                 과제 상세
    [id]/edit/            과제 수정
  admin/users/            사용자 관리 (운영자 전용)
lib/
  db.js                   node:sqlite 연결 + 스키마 마이그레이션
  auth.js                 세션/현재 사용자
  password.js             scrypt 해싱
  queries.js              과제·사용자 데이터 접근
  constants.js            상태/우선순위/권한 상수·한글 라벨
scripts/seed.mjs          초기 데이터 시드
scripts/import-asset-tasks.mjs  애셋 제작 목록(JSON) → 과제 임포터
scripts/gen-asset-tasks.mjs     게임 로스터에서 부족한 초상만 자동 과제화(코어시스템→아트팩→과제)
scripts/task-import.mjs         두 임포터가 공유하는 과제 등록 로직(중복 방지)
과제관리-실행.bat         윈도우 더블클릭 실행(자동 pull + dev 서버)
data/app.db               런타임 SQLite 파일 (git 제외)
```

## 데이터 저장

- SQLite 파일은 `data/app.db` 에 생성됩니다(WAL 모드). `.gitignore` 로 제외되어 있으니
  백업이 필요하면 해당 파일을 복사하세요.
- 첨부 이미지 업로드 파일은 `public/uploads/` 에 저장됩니다(`.gitignore` 로 제외).
  과제 상세 화면에서 이미지를 올리면 썸네일로 표시되고, `/uploads/<파일명>` 으로
  내려받을 수 있습니다. 런타임에 올라온 파일도 `next start` 에서 제대로 서빙되도록
  `app/uploads/[name]/route.js` 라우트가 디스크에서 직접 읽어 내보냅니다.

## 아트 파일 전달 흐름 (게임팩 ↔ 과제관리 ↔ 아트팩)

이 과제 관리 시스템은 게임팩과 아트팩 사이의 **다리**입니다. 아트 이미지는 이렇게 전달됩니다.

1. 게임팩 로스터에서 부족한 초상 목록을 과제로 등록합니다(`gen-asset-tasks.mjs`).
2. 아트 담당자가 해당 과제 상세 화면에서 완성한 이미지를 **업로드**합니다.
3. 업로드된 파일은 `public/uploads/` 에 저장되고 과제에 첨부로 매답니다.
4. 그 파일을 내려받아 게임팩의 규격 경로(`assets/char/<컨셉>/<id>.png`)에 넣으면 반영됩니다.

## 권한 정책 메모

- 마지막 운영자 계정은 삭제하거나 권한을 낮출 수 없습니다.
- 본인 계정은 스스로 삭제할 수 없습니다.
