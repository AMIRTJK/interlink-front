import * as React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { T, getRoleColor, thStyle } from "../../theme/tokens";
import type { RoleCard } from "../../model";
import { countTotalPerms } from "./rolesViewModel";

interface IProps {
  roleCards: RoleCard[];
  selectedRoleId: string | null;
  drawerOpen: boolean;
  onCardClick: (cardId: string) => void;
  onDeleteRole: (cardId: string) => void;
}

export function RolesRegistryTable({
  roleCards,
  selectedRoleId,
  drawerOpen,
  onCardClick,
  onDeleteRole,
}: IProps) {
  return (
    <div
      style={{
        background: T.surface,
        borderRadius: 10,
        border: `1px solid ${T.border}`,
        overflow: "hidden",
        boxShadow: T.shadow,
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: T.bg }}>
            <th style={{ ...thStyle, width: 32, padding: "0 8px 0 16px" }} />
            <th style={{ ...thStyle, textAlign: "left", paddingLeft: 8 }}>
              Название роли
            </th>
            <th style={{ ...thStyle, textAlign: "left" }}>Описание</th>
            <th style={{ ...thStyle, textAlign: "left" }}>
              Пользователей
            </th>
            <th style={{ ...thStyle, textAlign: "left" }}>Разрешений</th>
            <th style={{ ...thStyle, textAlign: "left" }}>
              Дата создания
            </th>
            <th
              style={{
                ...thStyle,
                textAlign: "center",
                paddingRight: 16,
              }}
            >
              Действия
            </th>
          </tr>
        </thead>
        <tbody>
          {roleCards.map((card) => {
            const isSelected = selectedRoleId === card.id && drawerOpen;
            const borderColor = getRoleColor(card.name).text;
            const permCount = countTotalPerms(card.perms);
            return (
              <tr
                key={card.id}
                onClick={() => onCardClick(card.id)}
                style={{
                  height: 48,
                  borderBottom: `1px solid #F1F5F9`,
                  background: isSelected ? `${borderColor}08` : "transparent",
                  cursor: "pointer",
                  transition: "background 0.12s",
                  borderLeft: `4px solid ${borderColor}`,
                }}
                onMouseEnter={(e) => {
                  if (!isSelected)
                    (e.currentTarget as HTMLTableRowElement).style.background =
                      "#F8FAFC";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLTableRowElement).style.background =
                    isSelected ? `${borderColor}08` : "transparent";
                }}
              >
                <td
                  style={{
                    padding: "0 8px 0 12px",
                    verticalAlign: "middle",
                    width: 32,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: borderColor,
                      display: "inline-block",
                    }}
                  />
                </td>
                <td
                  style={{
                    padding: "0 12px 0 8px",
                    verticalAlign: "middle",
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: borderColor,
                    }}
                  >
                    {card.name}
                  </span>
                </td>
                <td
                  style={{
                    padding: "0 12px",
                    verticalAlign: "middle",
                    maxWidth: 220,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      color: T.textSecondary,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "block",
                      maxWidth: 200,
                    }}
                  >
                    {card.description}
                  </span>
                </td>
                <td style={{ padding: "0 12px", verticalAlign: "middle" }}>
                  <span
                    style={{
                      background: `${borderColor}12`,
                      color: borderColor,
                      borderRadius: 20,
                      padding: "2px 10px",
                      fontSize: 12,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {card.userCount} чел.
                  </span>
                </td>
                <td style={{ padding: "0 12px", verticalAlign: "middle" }}>
                  <span style={{ fontSize: 13, color: T.textSecondary }}>
                    {permCount} разрешений
                  </span>
                </td>
                <td style={{ padding: "0 12px", verticalAlign: "middle" }}>
                  <span style={{ fontSize: 12, color: T.textSecondary }}>
                    {card.createdAt}
                  </span>
                </td>
                <td
                  style={{
                    padding: "0 16px 0 12px",
                    verticalAlign: "middle",
                    textAlign: "center",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <button
                      onClick={() => onCardClick(card.id)}
                      title="Редактировать"
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        border: `1px solid ${T.border}`,
                        background: T.surface,
                        color: T.textSecondary,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                      }}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      title="Удалить"
                      onClick={() => onDeleteRole(card.id)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        border: `1px solid ${T.border}`,
                        background: T.surface,
                        color: T.textSecondary,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
