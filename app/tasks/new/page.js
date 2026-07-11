// 새 과제 등록 화면
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listUsers } from "@/lib/queries";
import Nav from "@/components/Nav";
import TaskForm from "../TaskForm";
import { createTaskAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewTaskPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const users = listUsers();

  return (
    <>
      <Nav user={user} />
      <div className="container">
        <div className="page-head">
          <h1>새 과제 등록</h1>
        </div>
        <TaskForm action={createTaskAction} users={users} submitLabel="과제 등록" />
      </div>
    </>
  );
}
