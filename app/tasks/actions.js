"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  createTask,
  updateTask,
  deleteTask,
  getTask,
  replaceTaskLinks,
} from "@/lib/queries";
import { STATUS, PRIORITY } from "@/lib/constants";

function parseLinks(formData) {
  // Link inputs come as parallel arrays: link_label[] / link_url[]
  const labels = formData.getAll("link_label");
  const urls = formData.getAll("link_url");
  const links = [];
  for (let i = 0; i < urls.length; i++) {
    const url = String(urls[i] || "").trim();
    if (url) links.push({ label: String(labels[i] || "").trim(), url });
  }
  return links;
}

function readTaskForm(formData) {
  const title = String(formData.get("title") || "").trim();
  const status = String(formData.get("status") || "todo");
  const priority = String(formData.get("priority") || "medium");
  const assigneeRaw = String(formData.get("assignee_id") || "");
  return {
    title,
    description: String(formData.get("description") || "").trim(),
    status: STATUS.includes(status) ? status : "todo",
    priority: PRIORITY.includes(priority) ? priority : "medium",
    category: String(formData.get("category") || "").trim(),
    due_date: String(formData.get("due_date") || "").trim() || null,
    assignee_id: assigneeRaw ? Number(assigneeRaw) : null,
  };
}

export async function createTaskAction(_prevState, formData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const data = readTaskForm(formData);
  if (!data.title) return { error: "제목을 입력하세요." };

  const id = createTask({ ...data, created_by: user.id });
  replaceTaskLinks(id, parseLinks(formData));

  revalidatePath("/");
  redirect(`/tasks/${id}`);
}

export async function updateTaskAction(_prevState, formData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = Number(formData.get("id"));
  const existing = getTask(id);
  if (!existing) return { error: "과제를 찾을 수 없습니다." };

  const data = readTaskForm(formData);
  if (!data.title) return { error: "제목을 입력하세요." };

  updateTask(id, data);
  replaceTaskLinks(id, parseLinks(formData));

  revalidatePath("/");
  revalidatePath(`/tasks/${id}`);
  redirect(`/tasks/${id}`);
}

export async function deleteTaskAction(formData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = Number(formData.get("id"));
  deleteTask(id);
  revalidatePath("/");
  redirect("/");
}

// Quick inline status change from the dashboard / detail view.
export async function setStatusAction(formData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = Number(formData.get("id"));
  const status = String(formData.get("status") || "");
  const existing = getTask(id);
  if (existing && STATUS.includes(status)) {
    updateTask(id, { ...existing, status });
  }
  revalidatePath("/");
  revalidatePath(`/tasks/${id}`);
}
