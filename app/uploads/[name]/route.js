// 업로드 첨부 파일 서빙 라우트
// next start(프로덕션)는 빌드 이후 public/에 추가된 파일을 정적 서빙하지 않으므로,
// 런타임에 올라온 업로드 파일은 이 라우트가 디스크에서 직접 읽어 내보낸다.
import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const TYPES = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

export async function GET(_req, { params }) {
  const { name } = await params;
  const safe = path.basename(String(name)); // 경로 탈출(../) 방지
  const file = path.join(UPLOAD_DIR, safe);
  if (!fs.existsSync(file)) {
    return new Response("Not found", { status: 404 });
  }
  const type = TYPES[path.extname(safe).toLowerCase()] || "application/octet-stream";
  return new Response(fs.readFileSync(file), {
    headers: { "Content-Type": type, "Cache-Control": "no-store" },
  });
}
