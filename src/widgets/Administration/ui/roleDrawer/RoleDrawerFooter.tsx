import * as React from "react";
import { Check, LogOut } from "lucide-react";
import { T } from "../../theme/tokens";

interface IProps {
  onSave: () => void;
  isPending: boolean;
  onDeleteRequest: () => void;
}

export function RoleDrawerFooter({
  onSave,
  isPending,
  onDeleteRequest,
}: IProps) {
  return (
    <div
      style={{
        padding: "12px 20px",
        borderTop: `1px solid ${T.border}`,
        display: "flex",
        gap: 8,
        flexShrink: 0,
        background: T.surface,
      }}
    >
      <button
        onClick={onSave}
        disabled={isPending}
        style={{
          flex: 1,
          padding: "0 14px",
          height: 36,
          borderRadius: 8,
          border: "none",
          background: T.accent,
          color: "#fff",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: T.font,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          opacity: isPending ? 0.7 : 1,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "#2563EB";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = T.accent;
        }}
      >
        <Check size={13} />
        <span>Сохранить</span>
      </button>
      <button
        onClick={onDeleteRequest}
        style={{
          padding: "0 12px",
          height: 36,
          borderRadius: 8,
          border: `1.5px solid ${T.danger}`,
          background: "transparent",
          color: T.danger,
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: T.font,
          display: "flex",
          alignItems: "center",
          gap: 5,
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "#FEF2F2";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "transparent";
        }}
      >
        <LogOut size={13} />
        <span>Удалить</span>
      </button>
    </div>
  );
}
