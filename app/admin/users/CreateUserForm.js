"use client";
// 계정 생성 입력 폼 (생성 성공 시 폼 초기화)

import { useActionState, useEffect, useRef } from "react";
import { createUserAction } from "./actions";
import { ROLES, ROLE_LABEL } from "@/lib/constants";

export default function CreateUserForm() {
  const [state, formAction, pending] = useActionState(createUserAction, {});
  const formRef = useRef(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form action={formAction} ref={formRef} className="card">
      {state?.error && <div className="error">{state.error}</div>}
      {state?.ok && (
        <div
          className="error"
          style={{ background: "rgba(46,204,113,0.12)", borderColor: "var(--green)", color: "#a7ecc4" }}
        >
          {state.message}
        </div>
      )}
      <div className="row">
        <label className="field">
          <span>아이디 *</span>
          <input name="username" autoComplete="off" />
        </label>
        <label className="field">
          <span>이름 *</span>
          <input name="name" autoComplete="off" />
        </label>
      </div>
      <div className="row">
        <label className="field">
          <span>비밀번호 *</span>
          <input name="password" type="password" autoComplete="new-password" />
        </label>
        <label className="field">
          <span>권한</span>
          <select name="role" defaultValue="manager">
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABEL[r]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button className="btn primary" disabled={pending}>
        {pending ? "생성 중…" : "계정 생성"}
      </button>
    </form>
  );
}
