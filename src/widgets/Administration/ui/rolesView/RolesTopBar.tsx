import * as React from "react";
import { Plus, LayoutGrid, List, ShieldPlus } from "lucide-react";
import { T } from "../../theme/tokens";
import type { RolesViewMode } from "./rolesViewModel";

interface IProps {
  viewMode: RolesViewMode;
  onSwitchView: (mode: RolesViewMode) => void;
  onCreateUiPerm: () => void;
  onCreateRole: () => void;
}

export function RolesTopBar({
  viewMode,
  onSwitchView,
  onCreateUiPerm,
  onCreateRole,
}: IProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: 20,
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
          Роли и доступы
        </h1>
        <p
          style={{
            margin: "3px 0 0",
            fontSize: 13,
            color: T.textSecondary,
          }}
        >
          Управление ролями пользователей СЭД
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button
            onClick={() => onSwitchView("block")}
            title="Блочный вид"
            aria-label="Блочный вид"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: viewMode === "block" ? "none" : `1px solid #E2E8F0`,
              background: viewMode === "block" ? "#3B82F6" : "#FFFFFF",
              color: viewMode === "block" ? "#FFFFFF" : "#94A3B8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s ease",
              flexShrink: 0,
              padding: 0,
            }}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => onSwitchView("registry")}
            title="Реестровый вид"
            aria-label="Реестровый вид"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: viewMode === "registry" ? "none" : `1px solid #E2E8F0`,
              background: viewMode === "registry" ? "#3B82F6" : "#FFFFFF",
              color: viewMode === "registry" ? "#FFFFFF" : "#94A3B8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s ease",
              flexShrink: 0,
              padding: 0,
            }}
          >
            <List size={15} />
          </button>
        </div>
        <button
          onClick={onCreateUiPerm}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "0 16px",
            height: 36,
            borderRadius: 8,
            border: `1px solid ${T.border}`,
            background: "#fff",
            color: T.textSecondary,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: T.font,
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              T.hoverBg;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "#fff";
          }}
        >
          <ShieldPlus size={14} />
          <span>Создать UI-право</span>
        </button>
        <button
          onClick={onCreateRole}
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
            (e.currentTarget as HTMLButtonElement).style.background =
              "#2563EB";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              T.accent;
          }}
        >
          <Plus size={14} />
          <span>Создать роль</span>
        </button>
      </div>
    </div>
  );
}
