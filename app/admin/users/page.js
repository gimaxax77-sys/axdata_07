import { redirect } from "next/navigation";
import { getCurrentUser, isOperator } from "@/lib/auth";
import { listUsers } from "@/lib/queries";
import { ROLES, ROLE_LABEL } from "@/lib/constants";
import Nav from "@/components/Nav";
import CreateUserForm from "./CreateUserForm";
import { updateRoleAction, deleteUserAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function UsersAdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isOperator(user)) {
    return (
      <>
        <Nav user={user} />
        <div className="container">
          <div className="page-head">
            <h1>사용자 관리</h1>
          </div>
          <div className="error">이 페이지는 운영자만 접근할 수 있습니다.</div>
        </div>
      </>
    );
  }

  const users = listUsers();

  return (
    <>
      <Nav user={user} />
      <div className="container">
        <div className="page-head">
          <h1>사용자 관리</h1>
        </div>

        <h3 style={{ margin: "8px 0" }}>새 계정 생성</h3>
        <CreateUserForm />

        <h3 style={{ margin: "26px 0 8px" }}>계정 목록</h3>
        <div className="card" style={{ padding: 0, overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>아이디</th>
                <th>이름</th>
                <th>권한</th>
                <th>생성일</th>
                <th style={{ width: 220 }}>작업</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{u.name}</td>
                  <td>
                    <span className={`badge role-${u.role}`}>{ROLE_LABEL[u.role]}</span>
                  </td>
                  <td className="muted">{u.created_at}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <form action={updateRoleAction} style={{ display: "flex", gap: 6 }}>
                        <input type="hidden" name="id" value={u.id} />
                        <select name="role" defaultValue={u.role} className="small">
                          {ROLES.map((r) => (
                            <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                          ))}
                        </select>
                        <button className="btn small">변경</button>
                      </form>
                      {u.id !== user.id && (
                        <form action={deleteUserAction}>
                          <input type="hidden" name="id" value={u.id} />
                          <button className="btn small danger">삭제</button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>
          ※ 마지막 운영자 계정은 삭제하거나 권한을 낮출 수 없습니다. 본인 계정은 삭제할 수 없습니다.
        </p>
      </div>
    </>
  );
}
