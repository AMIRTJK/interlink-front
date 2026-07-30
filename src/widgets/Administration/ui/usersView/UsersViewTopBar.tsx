import * as React from "react";
import { Plus } from "lucide-react";
import { T } from "../../theme/tokens";

interface IProps {
  onOpenAdd: () => void;
}

export function UsersViewTopBar({ onOpenAdd }: IProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 700,
            color: T.textPrimary,
            letterSpacing: "-0.02em",
          }}
        >
          Пользователи
        </h1>
        <p
          style={{
            margin: "3px 0 0",
            fontSize: 13,
            color: T.textSecondary,
          }}
        >
          Управление сотрудниками и доступами
        </p>
      </div>
      <button
        onClick={onOpenAdd}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "0 16px",
          height: 36,
          borderRadius: 8,
          border: "none",
          background: T.accent,
          color: "#fff",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: T.font,
          boxShadow: `0 2px 8px ${T.accent}35`,
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "#2563EB";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = T.accent;
        }}
      >
        <Plus size={14} />
        <span>Добавить</span>
      </button>
    </div>
  );
}
