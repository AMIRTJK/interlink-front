import * as React from "react";
import { T, getRoleColor } from "../../theme/tokens";
import type { RoleCard } from "../../model";
import { countTotalPerms } from "./rolesViewModel";

interface IProps {
  roleCards: RoleCard[];
  selectedRoleId: string | null;
  drawerOpen: boolean;
  pulsingCardId: string | null;
  onCardClick: (cardId: string) => void;
  onDeleteRole: (cardId: string) => void;
}

export function RolesBlockCards({
  roleCards,
  selectedRoleId,
  drawerOpen,
  pulsingCardId,
  onCardClick,
  onDeleteRole,
}: IProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 12,
      }}
    >
      {roleCards.map((card) => {
        const isSelected = selectedRoleId === card.id && drawerOpen;
        const isPulsing = pulsingCardId === card.id;
        const borderColor = getRoleColor(card.name).text;
        const permCount = countTotalPerms(card.perms);
        return (
          <div
            key={card.id}
            onClick={() => onCardClick(card.id)}
            style={{
              background: isSelected ? `${borderColor}0D` : T.surface,
              borderRadius: 10,
              padding: "14px 16px",
              borderTop: isSelected
                ? `1px solid ${borderColor}40`
                : `1px solid ${T.border}`,
              borderRight: isSelected
                ? `1px solid ${borderColor}40`
                : `1px solid ${T.border}`,
              borderBottom: isSelected
                ? `1px solid ${borderColor}40`
                : `1px solid ${T.border}`,
              borderLeft: `4px solid ${borderColor}`,
              cursor: "pointer",
              transition:
                "border-color 0.15s, box-shadow 0.15s, background 0.15s",
              boxShadow: isPulsing
                ? `0 0 0 0 ${borderColor}33`
                : isSelected
                  ? `0 4px 12px ${borderColor}15`
                  : T.shadow,
              animation: isPulsing
                ? "cardPulse 0.6s ease-out forwards"
                : "none",
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                (e.currentTarget as HTMLDivElement).style.boxShadow = T.shadowMd;
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderTopColor = `${borderColor}40`;
                el.style.borderRightColor = `${borderColor}40`;
                el.style.borderBottomColor = `${borderColor}40`;
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                (e.currentTarget as HTMLDivElement).style.boxShadow = T.shadow;
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderTopColor = T.border;
                el.style.borderRightColor = T.border;
                el.style.borderBottomColor = T.border;
              }
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: borderColor,
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: T.textPrimary,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {card.name}
                </span>
              </div>
              <span
                style={{
                  background: T.hoverBg,
                  color: T.textSecondary,
                  borderRadius: 20,
                  padding: "2px 8px",
                  fontSize: 11,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  marginLeft: 6,
                }}
              >
                {card.userCount}
              </span>
            </div>
            <div
              style={{
                fontSize: 12,
                color: T.textSecondary,
                marginBottom: 10,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {card.description}
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 4,
                marginBottom: 10,
              }}
            >
              {permCount > 0 && (
                <span
                  style={{
                    background: `${borderColor}10`,
                    color: borderColor,
                    borderRadius: 5,
                    padding: "1px 5px",
                    fontSize: 10,
                    fontWeight: 600,
                    border: `1px solid ${borderColor}25`,
                    height: 18,
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  {permCount} разр.
                </span>
              )}
            </div>
            <div
              style={{
                borderTop: `1px solid ${T.border}`,
                paddingTop: 8,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCardClick(card.id);
                }}
                style={{
                  fontSize: 11,
                  color: T.accent,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: T.font,
                  fontWeight: 500,
                  padding: 0,
                }}
              >
                Ред.
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteRole(card.id);
                }}
                style={{
                  fontSize: 11,
                  color: T.danger,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: T.font,
                  fontWeight: 500,
                  padding: 0,
                }}
              >
                Уд.
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
