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
  - 첨부/링크(URL) 여러 개 등록
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

게임(`axdata_01`)의 "만들어야 할 애셋 목록(JSON)"을 이 과제 관리 시스템에 과제로 자동 등록하는 연결 다리입니다.

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

## 프로젝트 구조

```
app/
  page.js                 대시보드 (과제 목록·통계·필터)
  login/                  로그인 화면 + 인증 서버 액션
  logout/route.js         로그아웃
  tasks/
    actions.js            과제 생성/수정/삭제/상태변경 서버 액션
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
과제관리-실행.bat         윈도우 더블클릭 실행(자동 pull + dev 서버)
data/app.db               런타임 SQLite 파일 (git 제외)
```

## 데이터 저장

- SQLite 파일은 `data/app.db` 에 생성됩니다(WAL 모드). `.gitignore` 로 제외되어 있으니
  백업이 필요하면 해당 파일을 복사하세요.
- 첨부 파일 업로드용 디렉터리는 `public/uploads/` 입니다.

## 권한 정책 메모

- 마지막 운영자 계정은 삭제하거나 권한을 낮출 수 없습니다.
- 본인 계정은 스스로 삭제할 수 없습니다.
