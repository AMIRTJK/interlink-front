import * as React from "react";
import { ChevronDown } from "lucide-react";
import { T } from "../../theme/tokens";
import { ToggleSwitch } from "../components";
import type { PermModule } from "../../model";
import {
  moduleSlug,
  countModuleToggles,
  isEcpLabel,
} from "./createRoleModalModel";

interface IProps {
  perms: PermModule[];
  activeModuleIdx: number;
  onScrollToModule: (idx: number) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onNavScroll: () => void;
  sectionRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  collapsed: Record<number, boolean>;
  onToggleCollapsed: (idx: number) => void;
  onSetModuleAll: (idx: number, val: boolean) => void;
  onTogglePerm: (mIdx: number, pIdx: number, spIdx: number) => void;
  accent: string;
}

export function CreateRolePermsPanel({
  perms,
  activeModuleIdx,
  onScrollToModule,
  scrollRef,
  onNavScroll,
  sectionRefs,
  collapsed,
  onToggleCollapsed,
  onSetModuleAll,
  onTogglePerm,
  accent,
}: IProps) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        minWidth: 0,
        background: T.surface,
      }}
    >
      {/* Module nav */}
      <div
        style={{
          width: 180,
          minWidth: 180,
          borderRight: `1px solid ${T.border}`,
          padding: "18px 10px",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: T.textSecondary,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            padding: "0 8px",
            marginBottom: 8,
          }}
        >
          Модули
        </div>
        {perms.length === 0 ? (
          <div
            style={{
              fontSize: 12,
              color: T.textSecondary,
              padding: "6px 8px",
            }}
          >
            Нет модулей
          </div>
        ) : (
          perms.map((mod, mIdx) => {
            const isActive = activeModuleIdx === mIdx;
            const { active, total } = countModuleToggles(mod);
            return (
              <button
                key={moduleSlug(mod.module, mIdx)}
                onClick={() => onScrollToModule(mIdx)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "7px 9px",
                  marginBottom: 2,
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                  background: isActive ? `${accent}12` : "transparent",
                  color: isActive ? accent : T.textSecondary,
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 400,
                  fontFamily: T.font,
                  transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLButtonElement).style.background =
                      T.hoverBg;
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "transparent";
                }}
              >
                <span
                  style={{
                    display: "block",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {mod.module}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color: active > 0 ? accent : "#94A3B8",
                    fontWeight: 600,
                  }}
                >
                  {active}/{total}
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* Module cards */}
      <div
        ref={scrollRef}
        onScroll={onNavScroll}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "18px 20px",
          minWidth: 0,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {perms.length === 0 ? (
            <div
              style={{
                background: T.bg,
                borderRadius: 10,
                padding: "26px 16px",
                border: `1px dashed ${T.border}`,
                textAlign: "center",
                fontSize: 13,
                color: T.textSecondary,
              }}
            >
              Модули недоступны
            </div>
          ) : (
            perms.map((mod, mIdx) => {
              const isCollapsed = !!collapsed[mIdx];
              const { active, total } = countModuleToggles(mod);
              return (
                <div
                  key={moduleSlug(mod.module, mIdx)}
                  ref={(el) => {
                    sectionRefs.current[mIdx] = el;
                  }}
                  style={{
                    background: T.surface,
                    borderRadius: 10,
                    border: `1px solid ${T.border}`,
                    boxShadow: T.shadow,
                    overflow: "hidden",
                    scrollMarginTop: 8,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      padding: "12px 16px",
                      cursor: "pointer",
                      background: isCollapsed ? T.bg : T.surface,
                    }}
                    onClick={() => onToggleCollapsed(mIdx)}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: T.textPrimary,
                        }}
                      >
                        {mod.module}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: active > 0 ? accent : T.textSecondary,
                          fontWeight: 500,
                        }}
                      >
                        {active} из {total} активно
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        flexShrink: 0,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => onSetModuleAll(mIdx, active < total)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: accent,
                          fontSize: 12,
                          fontWeight: 600,
                          fontFamily: T.font,
                          padding: 0,
                        }}
                      >
                        {active < total ? "Выбрать все" : "Снять все"}
                      </button>
                      <button
                        aria-label={isCollapsed ? "Развернуть" : "Свернуть"}
                        onClick={() => onToggleCollapsed(mIdx)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 26,
                          height: 26,
                          borderRadius: 6,
                          border: `1px solid ${T.border}`,
                          background: T.surface,
                          color: T.textSecondary,
                          cursor: "pointer",
                        }}
                      >
                        <ChevronDown
                          size={13}
                          style={{
                            transform: isCollapsed
                              ? "rotate(-90deg)"
                              : "rotate(0deg)",
                            transition: "transform 0.2s ease",
                          }}
                        />
                      </button>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateRows: isCollapsed ? "0fr" : "1fr",
                      transition: "grid-template-rows 0.2s ease",
                    }}
                  >
                    <div style={{ overflow: "hidden", minHeight: 0 }}>
                      <div
                        style={{
                          borderTop: `1px solid ${T.border}`,
                          padding: "12px 16px 14px",
                          display: "flex",
                          flexDirection: "column",
                          gap: 12,
                        }}
                      >
                        {mod.perms.map((perm, pIdx) => (
                          <div key={`${perm.label}-${pIdx}`}>
                            {perm.label && (
                              <div
                                style={{
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color: T.textPrimary,
                                  background: T.bg,
                                  borderRadius: 6,
                                  padding: "6px 10px",
                                  marginBottom: 8,
                                }}
                              >
                                {perm.label}
                              </div>
                            )}
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                              }}
                            >
                              {perm.subperms &&
                                perm.subperms.map((sp, spIdx) => {
                                  const ecp = isEcpLabel(sp.label);
                                  return (
                                    <label
                                      key={sp.label}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 8,
                                        padding: "7px 10px",
                                        borderRadius: 6,
                                        cursor: "pointer",
                                        background: sp.value
                                          ? `${accent}08`
                                          : "transparent",
                                        transition: "background 0.15s",
                                      }}
                                      onMouseEnter={(e) => {
                                        if (!sp.value)
                                          (
                                            e.currentTarget as HTMLLabelElement
                                          ).style.background = T.hoverBg;
                                      }}
                                      onMouseLeave={(e) => {
                                        if (!sp.value)
                                          (
                                            e.currentTarget as HTMLLabelElement
                                          ).style.background = "transparent";
                                      }}
                                    >
                                      <span
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 7,
                                          minWidth: 0,
                                        }}
                                      >
                                        {ecp && (
                                          <span
                                            style={{
                                              fontSize: 9,
                                              fontWeight: 700,
                                              color: "#8B5CF6",
                                              background: "#F5F3FF",
                                              border: "1px solid #E9D5FF",
                                              borderRadius: 4,
                                              padding: "1px 5px",
                                              letterSpacing: "0.03em",
                                              flexShrink: 0,
                                            }}
                                          >
                                            ЭЦП
                                          </span>
                                        )}
                                        <span
                                          style={{
                                            fontSize: 13,
                                            color: sp.value
                                              ? T.textPrimary
                                              : T.textSecondary,
                                            fontWeight: sp.value ? 500 : 400,
                                          }}
                                        >
                                          {sp.label}
                                        </span>
                                      </span>
                                      <ToggleSwitch
                                        checked={sp.value}
                                        onChange={() =>
                                          onTogglePerm(mIdx, pIdx, spIdx)
                                        }
                                      />
                                    </label>
                                  );
                                })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
