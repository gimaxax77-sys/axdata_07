"use client";
// 로그인 입력 폼 (오류 메시지·전송중 상태 표시)

import { useActionState } from "react";
import { loginAction } from "./actions";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, {});

  return (
    <form action={formAction}>
      {state?.error && <div className="error">{state.error}</div>}
      <label className="field">
        <span>아이디</span>
        <input name="username" autoComplete="username" autoFocus />
      </label>
      <label className="field">
        <span>비밀번호</span>
        <input name="password" type="password" autoComplete="current-password" />
      </label>
      <button className="btn primary" style={{ width: "100%" }} disabled={pending}>
        {pending ? "로그인 중…" : "로그인"}
      </button>
    </form>
  );
}
