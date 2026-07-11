"use server";
// 로그인 인증 처리 (아이디·비밀번호 확인 후 세션 발급)

import { redirect } from "next/navigation";
import { getUserByUsername } from "@/lib/queries";
import {
  verifyPassword,
  createSession,
  setSessionCookie,
} from "@/lib/auth";

export async function loginAction(_prevState, formData) {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");

  if (!username || !password) {
    return { error: "아이디와 비밀번호를 입력하세요." };
  }

  const user = getUserByUsername(username);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return { error: "아이디 또는 비밀번호가 올바르지 않습니다." };
  }

  const { token, expires } = createSession(user.id);
  await setSessionCookie(token, expires);
  redirect("/");
}
