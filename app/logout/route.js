// 로그아웃 처리 (세션 삭제 후 로그인 화면으로 이동)
import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function GET(request) {
  await clearSessionCookie();
  return NextResponse.redirect(new URL("/login", request.url));
}

export async function POST(request) {
  await clearSessionCookie();
  return NextResponse.redirect(new URL("/login", request.url));
}
