"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, hashPassword, isOperator } from "@/lib/auth";
import {
  createUser,
  deleteUser,
  updateUserRole,
  getUserByUsername,
  getUserById,
  countOperators,
} from "@/lib/queries";
import { ROLES } from "@/lib/constants";

async function requireOperator() {
  const user = await getCurrentUser();
  if (!isOperator(user)) throw new Error("권한이 없습니다.");
  return user;
}

export async function createUserAction(_prevState, formData) {
  try {
    await requireOperator();
  } catch {
    return { error: "권한이 없습니다." };
  }

  const username = String(formData.get("username") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "manager");

  if (!username || !name || !password) {
    return { error: "모든 필드를 입력하세요." };
  }
  if (password.length < 4) {
    return { error: "비밀번호는 4자 이상이어야 합니다." };
  }
  if (!ROLES.includes(role)) {
    return { error: "잘못된 권한입니다." };
  }
  if (getUserByUsername(username)) {
    return { error: "이미 존재하는 아이디입니다." };
  }

  createUser({ username, name, passwordHash: hashPassword(password), role });
  revalidatePath("/admin/users");
  return { ok: true, message: `${name} 계정이 생성되었습니다.` };
}

export async function updateRoleAction(formData) {
  const me = await requireOperator();
  const id = Number(formData.get("id"));
  const role = String(formData.get("role") || "");
  if (!ROLES.includes(role)) return;

  const target = getUserById(id);
  if (!target) return;

  // Don't allow removing the last operator (including demoting yourself).
  if (target.role === "operator" && role !== "operator" && countOperators() <= 1) {
    return;
  }
  updateUserRole(id, role);
  revalidatePath("/admin/users");
}

export async function deleteUserAction(formData) {
  const me = await requireOperator();
  const id = Number(formData.get("id"));
  if (id === me.id) return; // can't delete yourself

  const target = getUserById(id);
  if (!target) return;
  if (target.role === "operator" && countOperators() <= 1) return; // keep 1 operator

  deleteUser(id);
  revalidatePath("/admin/users");
}
