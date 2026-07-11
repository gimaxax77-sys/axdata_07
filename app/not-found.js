// 404 페이지 (없는 경로·과제 접근 시 표시)
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="center-wrap">
      <div className="card" style={{ textAlign: "center" }}>
        <h1 style={{ marginTop: 0 }}>404</h1>
        <p className="muted">페이지 또는 과제를 찾을 수 없습니다.</p>
        <Link href="/" className="btn primary">
          대시보드로
        </Link>
      </div>
    </div>
  );
}
