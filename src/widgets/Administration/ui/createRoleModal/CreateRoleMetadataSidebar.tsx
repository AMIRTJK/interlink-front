import * as React from "react";
import { ShieldCheck, Check } from "lucide-react";
import { T, labelStyle, inputStyle } from "../../theme/tokens";
import {
  CREATE_ROLE_COLORS,
  DESC_MAX,
} from "./createRoleModalModel";

interface IProps {
  roleName: string;
  onRoleNameChange: (val: string) => void;
  description: string;
  onDescriptionChange: (val: string) => void;
  template: string;
  onTemplateChange: (val: string) => void;
  templates: { value: string; label: string }[];
  colorId: string | null;
  onColorIdChange: (id: string) => void;
  selectedColor: typeof CREATE_ROLE_COLORS[number] | null;
  accent: string;
}

export function CreateRoleMetadataSidebar({
  roleName,
  onRoleNameChange,
  description,
  onDescriptionChange,
  template,
  onTemplateChange,
  templates,
  colorId,
  onColorIdChange,
  selectedColor,
  accent,
}: IProps) {
  return (
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
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <label style={labelStyle}>Название роли</label>
          <input
            value={roleName}
            onChange={(e) => onRoleNameChange(e.target.value)}
            placeholder="Введите название роли"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Описание</label>
          <textarea
            value={description}
            onChange={(e) =>
              onDescriptionChange(e.target.value.slice(0, DESC_MAX))
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
              onChange={(e) => onTemplateChange(e.target.value)}
              style={{
                ...inputStyle,
                cursor: "pointer",
                paddingLeft: 32,
              }}
            >
              {templates.map((t) => (
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
                  onClick={() => onColorIdChange(c.id)}
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
  );
}
