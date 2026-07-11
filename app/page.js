import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listTasks, taskStats, listUsers } from "@/lib/queries";
import { STATUS, PRIORITY, STATUS_LABEL, PRIORITY_LABEL } from "@/lib/constants";
import Nav from "@/components/Nav";
import { StatusBadge, PriorityBadge } from "@/components/Badges";

export const dynamic = "force-dynamic";

function isOverdue(task) {
  if (!task.due_date || task.status === "done") return false;
  return task.due_date < new Date().toISOString().slice(0, 10);
}

export default async function Dashboard({ searchParams }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const sp = await searchParams;
  const filters = {
    status: sp?.status || "",
    priority: sp?.priority || "",
    assignee_id: sp?.assignee_id || "",
    q: sp?.q || "",
  };

  const tasks = listTasks(filters);
  const stats = taskStats();
  const users = listUsers();

  return (
    <>
      <Nav user={user} />
      <div className="container">
        <div className="page-head">
          <h1>대시보드</h1>
          <Link href="/tasks/new" className="btn primary">
            + 새 과제
          </Link>
        </div>

        <div className="stats">
          <div className="stat">
            <div className="num">{stats.total}</div>
            <div className="lbl">전체 과제</div>
          </div>
          <div className="stat">
            <div className="num" style={{ color: "var(--muted)" }}>{stats.todo}</div>
            <div className="lbl">대기</div>
          </div>
          <div className="stat">
            <div className="num" style={{ color: "var(--primary)" }}>
              {stats.in_progress}
            </div>
            <div className="lbl">진행중</div>
          </div>
          <div className="stat">
            <div className="num" style={{ color: "var(--green)" }}>{stats.done}</div>
            <div className="lbl">완료</div>
          </div>
          <div className="stat">
            <div className="num" style={{ color: "var(--danger)" }}>{stats.overdue}</div>
            <div className="lbl">기한 초과</div>
          </div>
        </div>

        <form className="filters" method="get">
          <input name="q" placeholder="검색 (제목·설명·분류)" defaultValue={filters.q} />
          <select name="status" defaultValue={filters.status}>
            <option value="">상태 전체</option>
            {STATUS.map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
          <select name="priority" defaultValue={filters.priority}>
            <option value="">우선순위 전체</option>
            {PRIORITY.map((p) => (
              <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>
            ))}
          </select>
          <select name="assignee_id" defaultValue={filters.assignee_id}>
            <option value="">담당자 전체</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          <button className="btn">필터</button>
          <Link href="/" className="btn">초기화</Link>
        </form>

        <div className="card" style={{ padding: 0, overflowX: "auto" }}>
          {tasks.length === 0 ? (
            <div className="empty">조건에 맞는 과제가 없습니다.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>제목</th>
                  <th>상태</th>
                  <th>우선순위</th>
                  <th>담당자</th>
                  <th>분류</th>
                  <th>마감일</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <Link href={`/tasks/${t.id}`} style={{ fontWeight: 600 }}>
                        {t.title}
                      </Link>
                    </td>
                    <td><StatusBadge status={t.status} /></td>
                    <td><PriorityBadge priority={t.priority} /></td>
                    <td>{t.assignee_name || <span className="muted">미지정</span>}</td>
                    <td>{t.category || <span className="muted">—</span>}</td>
                    <td className={isOverdue(t) ? "overdue" : ""}>
                      {t.due_date || <span className="muted">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
