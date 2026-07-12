"use server";
// 과제 생성·수정·삭제·상태변경·파일첨부 서버 액션

import fs from "node:fs";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  createTask,
  updateTask,
  deleteTask,
  getTask,
  replaceTaskLinks,
  addTaskLink,
  deleteTaskLink,
} from "@/lib/queries";
import { STATUS, PRIORITY } from "@/lib/constants";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_UPLOAD = 8 * 1024 * 1024; // 8MB

// 업로드 파일명 안전화: 디렉터리 성분 제거 + 위험문자 치환(한글은 허용).
function safeName(name) {
  const base = path.basename(String(name || "file"));
  return base.replace(/[^\w.\-가-힣]/g, "_").replace(/_{2,}/g, "_") || "file";
}

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

// 과제에 이미지 파일 첨부 — public/uploads 에 저장하고 kind='file' 링크로 기록.
// 게임팩이 요구하는 아트 파일을 이 다리를 통해 전달하는 통로.
export async function uploadFileAction(formData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = Number(formData.get("id"));
  if (!getTask(id)) redirect("/");

  const file = formData.get("file");
  if (!file || typeof file === "string" || file.size === 0) redirect(`/tasks/${id}?e=nofile`);
  if (!file.type.startsWith("image/")) redirect(`/tasks/${id}?e=type`);
  if (file.size > MAX_UPLOAD) redirect(`/tasks/${id}?e=size`);

  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const filename = `${id}-${Date.now()}-${safeName(file.name)}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, filename), Buffer.from(await file.arrayBuffer()));

  addTaskLink(id, { label: file.name, url: `/uploads/${filename}`, kind: "file" });

  revalidatePath("/");
  revalidatePath(`/tasks/${id}`);
  redirect(`/tasks/${id}`);
}

// 첨부 이미지 삭제 — 링크 기록과 디스크 파일을 함께 정리.
export async function deleteFileAction(formData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = Number(formData.get("id"));
  const linkId = Number(formData.get("link_id"));
  const url = String(formData.get("url") || "");
  deleteTaskLink(linkId, id);
  if (url.startsWith("/uploads/")) {
    fs.rmSync(path.join(UPLOAD_DIR, path.basename(url)), { force: true });
  }
  revalidatePath(`/tasks/${id}`);
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
