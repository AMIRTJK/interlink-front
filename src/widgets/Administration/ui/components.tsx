// Общие презентационные компоненты, перенесённые из IAMDashboard.tsx
// (ToggleSwitch, MultiRolePicker, ModalBackdrop, ToastContainer).
// Тип роли генерализован RoleName → string.
import * as React from "react";
import { X, Plus, ChevronDown, CheckCircle } from "lucide-react";
import { T, getRoleColor } from "../theme/tokens";
import type { ToastItem } from "../model";

// ── ToggleSwitch ──────────────────────────────────────────────────────────────
export function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 32,
        height: 18,
        borderRadius: 9,
        backgroundColor: checked ? T.accent : "#E2E8F0",
        position: "relative",
        border: "none",
        cursor: "pointer",
        transition: "background-color 0.2s ease",
        flexShrink: 0,
        padding: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: checked ? 16 : 2,
          width: 14,
          height: 14,
          borderRadius: "50%",
          backgroundColor: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          transition: "left 0.2s ease",
        }}
      />
    </button>
  );
}

// ── Multi-Role Picker ─────────────────────────────────────────────────────────
export function MultiRolePicker({
  selectedRoles,
  onChange,
  activeRole,
  onActiveRoleClick,
  allRoleNames,
}: {
  selectedRoles: string[];
  onChange: (roles: string[]) => void;
  activeRole?: string | null;
  onActiveRoleClick?: (role: string) => void;
  allRoleNames: string[];
}) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const toggleRole = (role: string) => {
    if (selectedRoles.includes(role)) {
      if (selectedRoles.length === 1) return;
      onChange(selectedRoles.filter((r) => r !== role));
    } else onChange([...selectedRoles, role]);
  };
  const available = allRoleNames.filter((r) => !selectedRoles.includes(r));
  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {selectedRoles.map((role) => {
          const cfg = getRoleColor(role);
          const isActive = activeRole === role;
          return (
            <div
              key={role}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: isActive ? cfg.text + "15" : cfg.bg,
                color: cfg.text,
                borderRadius: 6,
                padding: "4px 8px 4px 10px",
                fontSize: 12,
                fontWeight: 500,
                border: isActive
                  ? `1.5px solid ${cfg.text}`
                  : `1px solid ${cfg.text}25`,
                cursor: onActiveRoleClick ? "pointer" : "default",
                transition: "border 0.15s, background 0.15s",
              }}
              onClick={() => onActiveRoleClick && onActiveRoleClick(role)}
            >
              <span>{role}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleRole(role);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: selectedRoles.length === 1 ? "not-allowed" : "pointer",
                  color: cfg.text,
                  opacity: selectedRoles.length === 1 ? 0.35 : 0.6,
                  display: "flex",
                  alignItems: "center",
                  padding: 1,
                  borderRadius: 3,
                }}
                title={
                  selectedRoles.length === 1
                    ? "Нельзя удалить единственную роль"
                    : `Убрать роль «${role}»`
                }
              >
                <X size={10} strokeWidth={2.5} />
              </button>
            </div>
          );
        })}
      </div>
      {available.length > 0 && (
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setDropdownOpen((p) => !p)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 11px",
              borderRadius: 6,
              border: "1.5px dashed #CBD5E1",
              background: "transparent",
              color: T.textSecondary,
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: T.font,
            }}
          >
            <Plus size={11} />
            <span>Добавить роль</span>
            <ChevronDown size={10} style={{ marginLeft: 2, opacity: 0.6 }} />
          </button>
          {dropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                left: 0,
                background: T.surface,
                borderRadius: 10,
                border: `1px solid ${T.border}`,
                boxShadow: T.shadowMd,
                zIndex: 9000,
                minWidth: 220,
                overflow: "hidden",
              }}
            >
              {available.map((role) => {
                const cfg = getRoleColor(role);
                return (
                  <button
                    key={role}
                    onClick={() => {
                      toggleRole(role);
                      setDropdownOpen(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      width: "100%",
                      padding: "9px 14px",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      fontFamily: T.font,
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        T.hoverBg;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "transparent";
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: cfg.text,
                        display: "inline-block",
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 13,
                        color: T.textPrimary,
                        fontWeight: 500,
                      }}
                    >
                      {role}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Toast Container ───────────────────────────────────────────────────────────
export function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 24,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            padding: "12px 16px",
            boxShadow: T.shadowMd,
            animation: "toastSlideIn 0.25s ease-out forwards",
            pointerEvents: "auto",
            minWidth: 260,
            maxWidth: 340,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "#ECFDF5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CheckCircle size={14} color={T.success} />
          </div>
          <span
            style={{
              fontSize: 13,
              color: T.textPrimary,
              fontWeight: 500,
              fontFamily: T.font,
              flex: 1,
            }}
          >
            {t.message}
          </span>
          <button
            onClick={() => onRemove(t.id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: T.textSecondary,
              padding: 2,
              display: "flex",
            }}
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Modal Backdrop ────────────────────────────────────────────────────────────
export function ModalBackdrop({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(15,23,42,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "backdropIn 0.18s ease-out",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.surface,
          borderRadius: 10,
          boxShadow: T.shadowXl,
          animation: "modalFadeIn 0.2s ease-out forwards",
          width: "100%",
          maxWidth: 540,
          maxHeight: "90vh",
          overflowY: "auto",
          margin: "0 16px",
        }}
      >
        {children}
      </div>
    </div>
  );
}
