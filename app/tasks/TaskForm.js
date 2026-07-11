"use client";
// 과제 입력 폼 (신규·수정 공용, 링크 여러 개 추가/삭제 지원)

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { STATUS, PRIORITY, STATUS_LABEL, PRIORITY_LABEL } from "@/lib/constants";

export default function TaskForm({ action, task, users, submitLabel }) {
  const [state, formAction, pending] = useActionState(action, {});
  const router = useRouter();
  const [links, setLinks] = useState(
    (task?.links || [])
      .filter((l) => l.kind !== "file")
      .map((l) => ({ label: l.label, url: l.url }))
  );

  function addLink() {
    setLinks((ls) => [...ls, { label: "", url: "" }]);
  }
  function removeLink(i) {
    setLinks((ls) => ls.filter((_, idx) => idx !== i));
  }
  function updateLink(i, key, value) {
    setLinks((ls) => ls.map((l, idx) => (idx === i ? { ...l, [key]: value } : l)));
  }

  return (
    <form action={formAction} className="card">
      {task && <input type="hidden" name="id" value={task.id} />}
      {state?.error && <div className="error">{state.error}</div>}

      <label className="field">
        <span>제목 *</span>
        <input name="title" defaultValue={task?.title || ""} autoFocus required />
      </label>

      <label className="field">
        <span>설명</span>
        <textarea name="description" defaultValue={task?.description || ""} />
      </label>

      <div className="row">
        <label className="field">
          <span>상태</span>
          <select name="status" defaultValue={task?.status || "todo"}>
            {STATUS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>우선순위</span>
          <select name="priority" defaultValue={task?.priority || "medium"}>
            {PRIORITY.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="row">
        <label className="field">
          <span>담당자</span>
          <select name="assignee_id" defaultValue={task?.assignee_id || ""}>
            <option value="">— 미지정 —</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.username})
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>분류 / 태그</span>
          <input
            name="category"
            defaultValue={task?.category || ""}
            placeholder="예: 개발, 디자인"
          />
        </label>
        <label className="field">
          <span>마감일</span>
          <input type="date" name="due_date" defaultValue={task?.due_date || ""} />
        </label>
      </div>

      <div className="field">
        <span style={{ display: "block", color: "var(--muted)", fontSize: 13, marginBottom: 5 }}>
          첨부 / 링크
        </span>
        {links.length === 0 && (
          <p className="muted" style={{ margin: "4px 0 8px" }}>
            등록된 링크가 없습니다.
          </p>
        )}
        {links.map((l, i) => (
          <div className="row" key={i} style={{ marginBottom: 8, alignItems: "center" }}>
            <input
              name="link_label"
              placeholder="라벨 (선택)"
              value={l.label}
              onChange={(e) => updateLink(i, "label", e.target.value)}
              style={{ maxWidth: 200 }}
            />
            <input
              name="link_url"
              placeholder="https://..."
              value={l.url}
              onChange={(e) => updateLink(i, "url", e.target.value)}
            />
            <button
              type="button"
              className="btn small danger"
              style={{ flex: "0 0 auto", minWidth: 0 }}
              onClick={() => removeLink(i)}
            >
              삭제
            </button>
          </div>
        ))}
        <button type="button" className="btn small" onClick={addLink}>
          + 링크 추가
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <button className="btn primary" disabled={pending}>
          {pending ? "저장 중…" : submitLabel || "저장"}
        </button>
        <button type="button" className="btn" onClick={() => router.back()}>
          취소
        </button>
      </div>
    </form>
  );
}
