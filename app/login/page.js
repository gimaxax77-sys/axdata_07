import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const metadata = { title: "로그인 · 과제 관리" };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <div className="center-wrap">
      <div className="card login-card">
        <h1 style={{ marginTop: 0, fontSize: 20 }}>과제 관리 시스템</h1>
        <p className="muted" style={{ marginTop: -6 }}>
          운영자 · 매니저 로그인
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
