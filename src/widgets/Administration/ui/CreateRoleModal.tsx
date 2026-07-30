import * as React from "react";
import { X, Check } from "lucide-react";
import { T, cancelBtnStyle, primaryBtnStyle } from "../theme/tokens";
import type { RoleCard } from "../model";

import { useCreateRoleModalState } from "./createRoleModal/useCreateRoleModalState";
import { CreateRoleMetadataSidebar } from "./createRoleModal/CreateRoleMetadataSidebar";
import { CreateRolePermsPanel } from "./createRoleModal/CreateRolePermsPanel";

export function CreateRoleModal({
  allPermNames,
  roleCards,
  onClose,
  onCreated,
  addToast,
}: {
  allPermNames: string[];
  roleCards: RoleCard[];
  onClose: () => void;
  onCreated: () => void;
  addToast: (msg: string) => void;
}) {
  const {
    roleName,
    setRoleName,
    description,
    setDescription,
    template,
    setTemplate,
    colorId,
    setColorId,
    perms,
    collapsed,
    setCollapsed,
    activeModuleIdx,
    scrollRef,
    sectionRefs,
    CREATE_ROLE_TEMPLATES,
    selectedColor,
    accent,
    totalSelected,
    createRoleM,
    togglePerm,
    setModuleAll,
    scrollToModule,
    handleNavScroll,
    handleSubmit,
  } = useCreateRoleModalState({
    allPermNames,
    roleCards,
    onClose,
    onCreated,
    addToast,
  });

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
          width: "min(1100px, 94vw)",
          height: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          fontFamily: T.font,
        }}
      >
        {/* Header */}
        <div
          style={{
            flexShrink: 0,
            padding: "0 24px",
            borderBottom: `1px solid ${T.border}`,
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <h2
              style={{
                margin: 0,
                fontSize: 17,
                fontWeight: 700,
                color: T.textPrimary,
                letterSpacing: "-0.02em",
              }}
            >
              Создание роли
            </h2>
            <p
              style={{ margin: "2px 0 0", fontSize: 13, color: T.textSecondary }}
            >
              Настройте название и права доступа
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 12px",
                  borderRadius: 20,
                  background: "#EFF6FF",
                  color: T.accent,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: T.accent,
                    color: "#fff",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  1
                </span>
                <span>Основная информация</span>
              </span>
              <span
                style={{
                  width: 16,
                  height: 1.5,
                  background: T.border,
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 12px",
                  borderRadius: 20,
                  background: T.hoverBg,
                  color: T.textSecondary,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: T.border,
                    color: "#fff",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  2
                </span>
                <span>Права доступа</span>
              </span>
            </div>
            <button
              onClick={onClose}
              aria-label="Закрыть"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: 8,
                border: `1px solid ${T.border}`,
                background: "transparent",
                color: T.textSecondary,
                cursor: "pointer",
                flexShrink: 0,
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
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
          <CreateRoleMetadataSidebar
            roleName={roleName}
            onRoleNameChange={setRoleName}
            description={description}
            onDescriptionChange={setDescription}
            template={template}
            onTemplateChange={setTemplate}
            templates={CREATE_ROLE_TEMPLATES}
            colorId={colorId}
            onColorIdChange={setColorId}
            selectedColor={selectedColor}
            accent={accent}
          />

          <CreateRolePermsPanel
            perms={perms}
            activeModuleIdx={activeModuleIdx}
            onScrollToModule={scrollToModule}
            scrollRef={scrollRef}
            onNavScroll={handleNavScroll}
            sectionRefs={sectionRefs}
            collapsed={collapsed}
            onToggleCollapsed={(idx) =>
              setCollapsed((prev) => ({ ...prev, [idx]: !prev[idx] }))
            }
            onSetModuleAll={setModuleAll}
            onTogglePerm={togglePerm}
            accent={accent}
          />
        </div>

        {/* Footer */}
        <div
          style={{
            flexShrink: 0,
            padding: "0 24px",
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            borderTop: `1px solid ${T.border}`,
            background: T.surface,
          }}
        >
          <span
            style={{ fontSize: 13, color: T.textSecondary, fontWeight: 500 }}
          >
            <span>Выбрано </span>
            <strong style={{ color: accent }}>{totalSelected}</strong>
            <span> разрешений</span>
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} style={cancelBtnStyle}>
              Отмена
            </button>
            <button
              onClick={handleSubmit}
              disabled={createRoleM.isPending || !roleName.trim()}
              style={{
                ...primaryBtnStyle,
                background: accent,
                boxShadow: `0 2px 10px ${accent}40`,
                opacity: createRoleM.isPending || !roleName.trim() ? 0.6 : 1,
              }}
            >
              <Check size={14} />
              <span>Создать роль</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
