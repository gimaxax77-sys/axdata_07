// 상태·우선순위를 색상 배지로 표시하는 컴포넌트
import { STATUS_LABEL, PRIORITY_LABEL } from "@/lib/constants";

export function StatusBadge({ status }) {
  return (
    <span className={`badge status-${status}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  return (
    <span className={`badge prio-${priority}`}>
      {PRIORITY_LABEL[priority] ?? priority}
    </span>
  );
}
