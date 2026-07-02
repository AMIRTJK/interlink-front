// Порт CreateRoleModal из IAMDashboard.tsx — создание роли (2 шага: инфо + права).
// Данные: матрица прав из реального каталога; базовые шаблоны — существующие роли.
// Сохранение через CREATE_ROLE ({ name, description, permissions }).
import * as React from "react";
import { X, Check, ShieldCheck, ChevronDown } from "lucide-react";
import { useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import {
  T,
  labelStyle,
  inputStyle,
  cancelBtnStyle,
  primaryBtnStyle,
} from "../theme/tokens";
import { ToggleSwitch } from "./components";
import type { RoleCard, PermModule } from "../model";
import { buildPermModules, collectEnabledPermNames } from "../lib/adapters";

const CREATE_ROLE_COLORS: {
  id: string;
  label: string;
  bg: string;
  text: string;
}[] = [
  { id: "blue", label: "Синий", bg: "#EFF6FF", text: "#3B82F6" },
  { id: "green", label: "Зелёный", bg: "#ECFDF5", text: "#10B981" },
  { id: "amber", label: "Янтарный", bg: "#FFF7ED", text: "#F59E0B" },
  { id: "red", label: "Красный", bg: "#FEF2F2", text: "#EF4444" },
  { id: "purple", label: "Фиолетовый", bg: "#F5F3FF", text: "#8B5CF6" },
  { id: "pink", label: "Розовый", bg: "#FDF2F8", text: "#EC4899" },
  { id: "teal", label: "Бирюзовый", bg: "#F0FDFA", text: "#14B8A6" },
  { id: "slate", label: "Серый", bg: "#F1F5F9", text: "#64748B" },
];

function moduleSlug(name: string, idx: number): string {
  return `crm-mod-${idx}-${name.length}`;
}
function countModuleToggles(mod: PermModule): { active: number; total: number } {
  let active = 0;
  let total = 0;
  mod.perms.forEach((perm) => {
    if (perm.subperms)
      perm.subperms.forEach((sp) => {
        total += 1;
        if (sp.value) active += 1;
      });
    if (perm.children)
      perm.children.forEach((ch) => {
        if (ch.subperms)
          ch.subperms.forEach((csp) => {
            total += 1;
            if (csp.value) active += 1;
          });
      });
  });
  return { active, total };
}
function isEcpLabel(label: string): boolean {
  return label.trim().startsWith("ЭЦП");
}

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
  const [roleName, setRoleName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [template, setTemplate] = React.useState("empty");
  const [colorId, setColorId] = React.useState<string | null>(null);

  const resolveTemplatePerms = React.useCallback(
    (tpl: string): PermModule[] => {
      if (tpl === "empty") return buildPermModules(allPermNames, []);
      const card = roleCards.find((c) => c.id === tpl);
      return buildPermModules(allPermNames, card ? card.permissionNames : []);
    },
    [allPermNames, roleCards],
  );

  const [perms, setPerms] = React.useState<PermModule[]>(() =>
    resolveTemplatePerms("empty"),
  );
  const [collapsed, setCollapsed] = React.useState<Record<number, boolean>>({});
  const [activeModuleIdx, setActiveModuleIdx] = React.useState(0);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const sectionRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  React.useEffect(() => {
    setPerms(resolveTemplatePerms(template));
    setCollapsed({});
  }, [template, resolveTemplatePerms]);

  const CREATE_ROLE_TEMPLATES = React.useMemo(
    () => [
      { value: "empty", label: "Пустая роль" },
      ...roleCards.map((r) => ({
        value: r.id,
        label: `На основе «${r.name}»`,
      })),
    ],
    [roleCards],
  );

  const DESC_MAX = 200;
  const selectedColor =
    CREATE_ROLE_COLORS.find((c) => c.id === colorId) ?? null;
  const accent = selectedColor ? selectedColor.text : T.accent;
  const totalSelected = React.useMemo(
    () => perms.reduce((sum, m) => sum + countModuleToggles(m).active, 0),
    [perms],
  );

  const createRoleM = useMutationQuery({
    url: () => ApiRoutes.CREATE_ROLE,
    method: "POST",
    messages: {
      suppressSuccessToast: true,
      invalidate: [ApiRoutes.GET_ROLES],
    },
  });

  const togglePerm = (mIdx: number, pIdx: number, spIdx: number) => {
    setPerms((prev) =>
      prev.map((m, mi) =>
        mi !== mIdx
          ? m
          : {
              ...m,
              perms: m.perms.map((p, pi) =>
                pi !== pIdx
                  ? p
                  : {
                      ...p,
                      subperms: p.subperms
                        ? p.subperms.map((sp, si) =>
                            si !== spIdx ? sp : { ...sp, value: !sp.value },
                          )
                        : p.subperms,
                    },
              ),
            },
      ),
    );
  };

  const setModuleAll = (mIdx: number, val: boolean) => {
    setPerms((prev) =>
      prev.map((m, mi) =>
        mi !== mIdx
          ? m
          : {
              ...m,
              perms: m.perms.map((p) => ({
                ...p,
                subperms: p.subperms
                  ? p.subperms.map((sp) => ({ ...sp, value: val }))
                  : p.subperms,
                children: p.children
                  ? p.children.map((ch) => ({
                      ...ch,
                      subperms: ch.subperms
                        ? ch.subperms.map((csp) => ({ ...csp, value: val }))
                        : ch.subperms,
                    }))
                  : p.children,
              })),
            },
      ),
    );
  };

  const scrollToModule = (mIdx: number) => {
    const el = sectionRefs.current[mIdx];
    const container = scrollRef.current;
    if (el && container)
      container.scrollTo({ top: el.offsetTop - 8, behavior: "smooth" });
    setActiveModuleIdx(mIdx);
  };

  const handleNavScroll = () => {
    const container = scrollRef.current;
    if (!container) return;
    const top = container.scrollTop;
    let current = 0;
    sectionRefs.current.forEach((el, idx) => {
      if (el && el.offsetTop - 60 <= top) current = idx;
    });
    setActiveModuleIdx(current);
  };

  const handleSubmit = () => {
    if (!roleName.trim()) return;
    createRoleM.mutate(
      {
        name: roleName.trim(),
        description: description.trim(),
        permissions: collectEnabledPermNames(perms),
      },
      {
        onSuccess: () => {
          addToast(`Роль «${roleName.trim()}» создана`);
          onCreated();
          onClose();
        },
      },
    );
  };

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
          {/* Left: metadata */}
          <div
            style={{
              width: 320,
              minWidth: 320,
              borderRight: `1px solid ${T.border}`,
              overflowY: "auto",
              padding: "24px 20px",
              background: T.bg,
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: 20 }}
            >
              <div>
                <label style={labelStyle}>Название роли</label>
                <input
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="Введите название роли"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Описание</label>
                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value.slice(0, DESC_MAX))
                  }
                  placeholder="Краткое описание назначения роли"
                  rows={3}
                  style={{
                    ...inputStyle,
                    height: "auto",
                    resize: "vertical",
                    padding: "8px 11px",
                    fontFamily: T.font,
                  }}
                />
                <div
                  style={{
                    marginTop: 4,
                    textAlign: "right",
                    fontSize: 11,
                    color: T.textSecondary,
                  }}
                >
                  {description.length} / {DESC_MAX}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Базовый шаблон</label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: 11,
                      top: "50%",
                      transform: "translateY(-50%)",
                      display: "flex",
                      pointerEvents: "none",
                      color: accent,
                    }}
                  >
                    <ShieldCheck size={14} />
                  </span>
                  <select
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                    style={{
                      ...inputStyle,
                      cursor: "pointer",
                      paddingLeft: 32,
                    }}
                  >
                    {CREATE_ROLE_TEMPLATES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Цвет роли</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {CREATE_ROLE_COLORS.map((c) => {
                    const isActive = colorId === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setColorId(c.id)}
                        title={c.label}
                        aria-label={c.label}
                        aria-pressed={isActive}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: c.text,
                          border: "2.5px solid #FFFFFF",
                          boxShadow: isActive
                            ? `0 0 0 2.5px ${c.text}`
                            : `0 0 0 1px ${T.border}`,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transform: isActive ? "scale(1.12)" : "scale(1)",
                          transition:
                            "transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.15s",
                          padding: 0,
                        }}
                      >
                        {isActive && (
                          <Check size={12} color="#fff" strokeWidth={3} />
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedColor && (
                  <div
                    style={{
                      marginTop: 10,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "5px 11px",
                      borderRadius: 6,
                      background: selectedColor.bg,
                      color: selectedColor.text,
                    }}
                  >
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: selectedColor.text,
                        display: "inline-block",
                      }}
                    />
                    <span style={{ fontSize: 12, fontWeight: 600 }}>
                      {roleName.trim() || "Новая роль"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: permissions */}
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
                      onClick={() => scrollToModule(mIdx)}
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
              onScroll={handleNavScroll}
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "18px 20px",
                minWidth: 0,
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
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
                          onClick={() =>
                            setCollapsed((prev) => ({
                              ...prev,
                              [mIdx]: !prev[mIdx],
                            }))
                          }
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
                              onClick={() => setModuleAll(mIdx, active < total)}
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
                              aria-label={
                                isCollapsed ? "Развернуть" : "Свернуть"
                              }
                              onClick={() =>
                                setCollapsed((prev) => ({
                                  ...prev,
                                  [mIdx]: !prev[mIdx],
                                }))
                              }
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
                                                ).style.background =
                                                  "transparent";
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
                                                  fontWeight: sp.value
                                                    ? 500
                                                    : 400,
                                                }}
                                              >
                                                {sp.label}
                                              </span>
                                            </span>
                                            <ToggleSwitch
                                              checked={sp.value}
                                              onChange={() =>
                                                togglePerm(mIdx, pIdx, spIdx)
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
