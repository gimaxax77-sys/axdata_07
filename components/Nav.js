import Link from "next/link";
import { ROLE_LABEL } from "@/lib/constants";

export default function Nav({ user }) {
  return (
    <nav className="nav">
      <Link href="/" className="brand">
        📋 과제 관리
      </Link>
      <Link href="/" className="navlink">
        대시보드
      </Link>
      <Link href="/tasks/new" className="navlink">
        새 과제
      </Link>
      {user?.role === "operator" && (
        <Link href="/admin/users" className="navlink">
          사용자 관리
        </Link>
      )}
      <span className="spacer" />
      {user && (
        <>
          <span className="whoami">
            {user.name}{" "}
            <span className={`badge role-${user.role}`}>
              {ROLE_LABEL[user.role]}
            </span>
          </span>
          <Link href="/logout" className="btn small">
            로그아웃
          </Link>
        </>
      )}
    </nav>
  );
}
