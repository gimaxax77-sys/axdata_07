// 과제 상세 화면 (정보 표시·상태 빠른 변경·삭제)
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getTask } from "@/lib/queries";
import { STATUS, STATUS_LABEL } from "@/lib/constants";
import Nav from "@/components/Nav";
import { StatusBadge, PriorityBadge } from "@/components/Badges";
import {
  deleteTaskAction,
  setStatusAction,
  uploadFileAction,
  deleteFileAction,
} from "../actions";

export const dynamic = "force-dynamic";

const UPLOAD_ERROR = {
  nofile: "파일을 선택하세요.",
  type: "이미지 파일만 올릴 수 있습니다.",
  size: "파일이 너무 큽니다 (최대 8MB).",
};

function isOverdue(task) {
  if (!task.due_date || task.status === "done") return false;
  return task.due_date < new Date().toISOString().slice(0, 10);
}

export default async function TaskDetail({ params, searchParams }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const { e } = (await searchParams) || {};
  const task = getTask(Number(id));
  if (!task) notFound();

  const files = (task.links || []).filter((l) => l.kind === "file" && l.url);
  const links = (task.links || []).filter((l) => l.kind !== "file" && l.url);

  return (
    <>
      <Nav user={user} />
      <div className="container">
        <div className="page-head">
          <h1>{task.title}</h1>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href={`/tasks/${task.id}/edit`} className="btn">
              수정
            </Link>
            <form action={deleteTaskAction}>
              <input type="hidden" name="id" value={task.id} />
              <button className="btn danger">삭제</button>
            </form>
          </div>
        </div>

        <div className="card grid" style={{ gridTemplateColumns: "1fr", gap: 18 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
            {task.category && <span className="badge role-manager">{task.category}</span>}
          </div>

          {task.description ? (
            <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{task.description}</p>
          ) : (
            <p className="muted" style={{ margin: 0 }}>설명이 없습니다.</p>
          )}

          <table style={{ maxWidth: 520 }}>
            <tbody>
              <tr>
                <th style={{ width: 120 }}>담당자</th>
                <td>{task.assignee_name || <span className="muted">미지정</span>}</td>
              </tr>
              <tr>
                <th>마감일</th>
                <td className={isOverdue(task) ? "overdue" : ""}>
                  {task.due_date || <span className="muted">—</span>}
                  {isOverdue(task) && " (기한 초과)"}
                </td>
              </tr>
              <tr>
                <th>등록자</th>
                <td>{task.creator_name || <span className="muted">—</span>}</td>
              </tr>
              <tr>
                <th>등록일</th>
                <td className="muted">{task.created_at}</td>
              </tr>
              <tr>
                <th>최종 수정</th>
                <td className="muted">{task.updated_at}</td>
              </tr>
            </tbody>
          </table>

          <div>
            <div className="muted" style={{ fontSize: 13, marginBottom: 6 }}>
              아트 파일 (이미지 업로드)
            </div>
            {files.length > 0 && (
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
                {files.map((f) => (
                  <div key={f.id} style={{ width: 128 }}>
                    <a href={f.url} target="_blank" rel="noreferrer">
                      <img
                        src={f.url}
                        alt={f.label || ""}
                        style={{
                          width: 128,
                          height: 128,
                          objectFit: "cover",
                          borderRadius: 8,
                          border: "1px solid #e2e2e2",
                          background:
                            "repeating-conic-gradient(#f0f0f0 0% 25%, #fff 0% 50%) 50% / 16px 16px",
                        }}
                      />
                    </a>
                    <div className="muted" style={{ fontSize: 11, wordBreak: "break-all", marginTop: 4 }}>
                      {f.label}
                    </div>
                    <form action={deleteFileAction}>
                      <input type="hidden" name="id" value={task.id} />
                      <input type="hidden" name="link_id" value={f.id} />
                      <input type="hidden" name="url" value={f.url} />
                      <button className="btn small danger">삭제</button>
                    </form>
                  </div>
                ))}
              </div>
            )}
            {e && UPLOAD_ERROR[e] && (
              <p className="overdue" style={{ margin: "0 0 6px" }}>{UPLOAD_ERROR[e]}</p>
            )}
            <form
              action={uploadFileAction}
              style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}
            >
              <input type="hidden" name="id" value={task.id} />
              <input type="file" name="file" accept="image/*" required />
              <button className="btn small primary">업로드</button>
            </form>
          </div>

          <div>
            <div className="muted" style={{ fontSize: 13, marginBottom: 6 }}>
              링크
            </div>
            {links.length === 0 ? (
              <p className="muted" style={{ margin: 0 }}>없음</p>
            ) : (
              <ul className="link-list">
                {links.map((l) => (
                  <li key={l.id}>
                    <a href={l.url} target="_blank" rel="noreferrer">
                      🔗 {l.label || l.url}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <div className="muted" style={{ fontSize: 13, marginBottom: 6 }}>
              상태 빠른 변경
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {STATUS.map((s) => (
                <form action={setStatusAction} key={s}>
                  <input type="hidden" name="id" value={task.id} />
                  <input type="hidden" name="status" value={s} />
                  <button
                    className={`btn small ${task.status === s ? "primary" : ""}`}
                    disabled={task.status === s}
                  >
                    {STATUS_LABEL[s]}
                  </button>
                </form>
              ))}
            </div>
          </div>
        </div>

        <p style={{ marginTop: 16 }}>
          <Link href="/">← 대시보드로</Link>
        </p>
      </div>
    </>
  );
}
