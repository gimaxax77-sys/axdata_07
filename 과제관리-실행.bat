@echo off
chcp 65001 >nul
title 과제 관리 시스템
cd /d "%~dp0"

echo ============================================
echo    과제 관리 시스템 실행
echo ============================================
echo.

REM Node.js 설치 확인
where node >nul 2>nul
if errorlevel 1 (
  echo [오류] Node.js 가 설치되어 있지 않습니다.
  echo        https://nodejs.org 에서 LTS 버전을 설치한 뒤 다시 실행하세요.
  echo.
  pause
  exit /b 1
)

REM 1) 최초 실행 시 필요한 패키지 설치
if not exist "node_modules\" (
  echo [1/3] 최초 실행입니다. 필요한 패키지를 설치합니다. 잠시 기다려 주세요...
  call npm install
  if errorlevel 1 (
    echo [오류] 패키지 설치에 실패했습니다.
    pause
    exit /b 1
  )
)

REM 2) 데이터베이스가 없으면 초기 데이터 생성
if not exist "data\app.db" (
  echo [2/3] 데이터베이스를 초기화합니다...
  call npm run seed
)

REM 3) 서버 실행 + 브라우저 자동 열기
echo [3/3] 서버를 시작합니다...
echo.
echo    잠시 후 브라우저에서 화면이 열립니다. (안 열리면 http://localhost:3000 접속)
echo.
echo    로그인 정보
echo      - 운영자 : operator / admin1234
echo      - 매니저 : manager  / manager1234
echo.
echo    * 종료하려면 이 검은 창을 닫거나 Ctrl+C 를 누르세요.
echo ============================================
echo.

REM 서버가 준비될 시간을 준 뒤 브라우저를 연다(별도 프로세스)
start "" cmd /c "timeout /t 8 >nul & start http://localhost:3000"

REM 개발 서버 실행(이 창에서 계속 동작)
call npm run dev

REM 서버가 종료되면 창이 바로 닫히지 않도록 대기
echo.
echo 서버가 종료되었습니다.
pause
