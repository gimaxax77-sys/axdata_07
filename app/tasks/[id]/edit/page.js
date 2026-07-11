import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getTask, listUsers } from "@/lib/queries";
import Nav from "@/components/Nav";
import TaskForm from "../../TaskForm";
import { updateTaskAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditTaskPage({ params }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const task = getTask(Number(id));
  if (!task) notFound();
  const users = listUsers();

  return (
    <>
      <Nav user={user} />
      <div className="container">
        <div className="page-head">
          <h1>과제 수정</h1>
        </div>
        <TaskForm
          action={updateTaskAction}
          task={task}
          users={users}
          submitLabel="변경 저장"
        />
      </div>
    </>
  );
}
