import * as React from "react";
import { Search, X, Check, AlertTriangle, CheckCircle } from "lucide-react";
import { T, getRoleColor, labelStyle, inputStyle } from "../../theme/tokens";
import type { ExtUser } from "../../model";
import type { AddUserEmployeeTab, SelectedEmployee } from "./addUserModalModel";

interface IProps {
  employeeTab: AddUserEmployeeTab;
  onSwitchTab: (tab: AddUserEmployeeTab) => void;
  existingDropRef: React.RefObject<HTMLDivElement | null>;
  existingDropdownOpen: boolean;
  onOpenExistingDropdown: () => void;
  existingSearch: string;
  onExistingSearchChange: (val: string) => void;
  onClearExistingSearch: () => void;
  searchResults: ExtUser[];
  selectedEmployee: SelectedEmployee | null;
  onSelectExistingEmployee: (u: ExtUser) => void;
  newFio: string;
  onNewFioChange: (val: string) => void;
  onNewSearch: () => void;
  newSearching: boolean;
  newSearchResult: "idle" | "found" | "notfound";
}

export function AddUserEmployeeSelection({
  employeeTab,
  onSwitchTab,
  existingDropRef,
  existingDropdownOpen,
  onOpenExistingDropdown,
  existingSearch,
  onExistingSearchChange,
  onClearExistingSearch,
  searchResults,
  selectedEmployee,
  onSelectExistingEmployee,
  newFio,
  onNewFioChange,
  onNewSearch,
  newSearching,
  newSearchResult,
}: IProps) {
  return (
    <div style={{ marginBottom: 24 }}>
      <label
        style={{
          ...labelStyle,
          fontSize: 13,
          fontWeight: 700,
          color: T.textPrimary,
          marginBottom: 12,
        }}
      >
        Выбор сотрудника
      </label>
      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: `2px solid ${T.border}`,
          marginBottom: 16,
        }}
      >
        {(
          [
            ["existing", "Существующие сотрудники"],
            ["new", "Новые сотрудники"],
          ] as const
        ).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => onSwitchTab(tab)}
            style={{
              padding: "7px 16px",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: employeeTab === tab ? 600 : 400,
              color: employeeTab === tab ? T.accent : T.textSecondary,
              fontFamily: T.font,
              borderBottom:
                employeeTab === tab
                  ? `2px solid ${T.accent}`
                  : "2px solid transparent",
              marginBottom: -2,
              transition: "color 0.15s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {employeeTab === "existing" && (
        <div ref={existingDropRef} style={{ position: "relative" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              border: `1.5px solid ${
                existingDropdownOpen ? T.accent : T.border
              }`,
              borderRadius: 8,
              padding: "8px 12px",
              background: T.surface,
              transition: "border-color 0.15s",
              cursor: "text",
            }}
            onClick={onOpenExistingDropdown}
          >
            <Search
              size={14}
              color={T.textSecondary}
              style={{ flexShrink: 0 }}
            />
            <input
              type="text"
              placeholder="Введите ФИО для поиска сотрудника..."
              value={existingSearch}
              onChange={(e) => onExistingSearchChange(e.target.value)}
              onFocus={onOpenExistingDropdown}
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 13,
                color: T.textPrimary,
                fontFamily: T.font,
                width: "100%",
              }}
            />
            {existingSearch && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClearExistingSearch();
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: T.textSecondary,
                  display: "flex",
                  padding: 2,
                  flexShrink: 0,
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>
          {existingDropdownOpen && (
            <div
              style={{
                marginTop: 8,
                background: T.surface,
                borderRadius: 10,
                border: `1px solid ${T.border}`,
                boxShadow: T.shadow,
                maxHeight: 180,
                overflowY: "auto",
              }}
            >
              {searchResults.length === 0 ? (
                <div
                  style={{
                    padding: "14px 16px",
                    fontSize: 13,
                    color: T.textSecondary,
                    textAlign: "center",
                  }}
                >
                  Сотрудник не найден
                </div>
              ) : (
                searchResults.map((u) => {
                  const cfg = getRoleColor(u.roles[0]);
                  const isSelected =
                    selectedEmployee?.source === "existing" &&
                    selectedEmployee.user.id === u.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => onSelectExistingEmployee(u)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        width: "100%",
                        padding: "11px 14px",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        background: isSelected ? "#EFF6FF" : "transparent",
                        fontFamily: T.font,
                        borderBottom: `1px solid ${T.border}`,
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected)
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = T.hoverBg;
                      }}
                      onMouseLeave={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = isSelected
                          ? "#EFF6FF"
                          : "transparent";
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          background: cfg.bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: 700,
                          color: cfg.text,
                          flexShrink: 0,
                          border: `1.5px solid ${cfg.text}20`,
                        }}
                      >
                        {u.avatarInitials}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: T.textPrimary,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {u.fio}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: T.textSecondary,
                            marginTop: 1,
                          }}
                        >
                          <span>{u.position}</span>
                          <span style={{ margin: "0 5px", color: T.border }}>
                            ·
                          </span>
                          <span>{u.department}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <Check
                          size={14}
                          color={T.accent}
                          style={{ flexShrink: 0 }}
                        />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {employeeTab === "new" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              placeholder="Введите ФИО нового сотрудника"
              value={newFio}
              onChange={(e) => onNewFioChange(e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              onClick={onNewSearch}
              disabled={newSearching || !newFio.trim()}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                background: !newFio.trim() ? T.border : T.accent,
                color: !newFio.trim() ? T.textSecondary : "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor: newFio.trim() ? "pointer" : "not-allowed",
                fontFamily: T.font,
                whiteSpace: "nowrap",
                flexShrink: 0,
                transition: "background 0.15s",
              }}
            >
              {newSearching ? "Поиск..." : "Найти в системе"}
            </button>
          </div>
          {newSearchResult === "notfound" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 13px",
                borderRadius: 8,
                background: "#FFFBEB",
                border: "1px solid #FDE68A",
                fontSize: 13,
                color: "#92400E",
              }}
            >
              <AlertTriangle size={13} style={{ flexShrink: 0 }} />
              <span>Сотрудник не найден — заполните данные вручную</span>
            </div>
          )}
          {newSearchResult === "found" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 13px",
                borderRadius: 8,
                background: "#ECFDF5",
                border: "1px solid #A7F3D0",
                fontSize: 13,
                color: "#065F46",
              }}
            >
              <CheckCircle size={13} style={{ flexShrink: 0 }} />
              <span>Сотрудник найден — данные заполнены автоматически</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
