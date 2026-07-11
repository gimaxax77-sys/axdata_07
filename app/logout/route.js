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
