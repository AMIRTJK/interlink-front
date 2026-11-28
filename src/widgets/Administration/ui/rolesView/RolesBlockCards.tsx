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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {roleCards.map((card) => {
        const isSelected = selectedRoleId === card.id && drawerOpen;
        const isPulsing = pulsingCardId === card.id;
        const borderColor = getRoleColor(card.name).text;
        const permCount = countTotalPerms(card.perms);
        return (
          <div
            key={card.id}
            onClick={() => onCardClick(card.id)}
            className={`rounded-[10px] px-4 py-3.5 cursor-pointer transition-all border border-slate-200 dark:border-slate-800 ${
              isSelected
                ? "shadow-md"
                : "bg-white dark:bg-slate-900/80 shadow-xs hover:shadow-md"
            }`}
            style={{
              background: isSelected ? `${borderColor}14` : undefined,
              borderTopColor: isSelected ? `${borderColor}55` : undefined,
              borderRightColor: isSelected ? `${borderColor}55` : undefined,
              borderBottomColor: isSelected ? `${borderColor}55` : undefined,
              borderLeft: `4px solid ${borderColor}`,
              animation: isPulsing
                ? "cardPulse 0.6s ease-out forwards"
                : "none",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="w-3 h-3 rounded-full inline-block shrink-0"
                  style={{ background: borderColor }}
                />
                <span className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {card.name}
                </span>
              </div>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap shrink-0 ml-1.5">
                {card.userCount}
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-2.5 truncate">
              {card.description}
            </div>
            <div className="flex flex-wrap gap-1 mb-2.5">
              {permCount > 0 && (
                <span
                  style={{
                    background: `${borderColor}14`,
                    color: borderColor,
                    borderRadius: 5,
                    padding: "1px 5px",
                    fontSize: 10,
                    fontWeight: 600,
                    border: `1px solid ${borderColor}30`,
                    height: 18,
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  {permCount} разр.
                </span>
              )}
            </div>
            <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex items-center gap-2.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCardClick(card.id);
                }}
                className="text-[11px] text-blue-500 hover:text-blue-400 bg-transparent border-0 cursor-pointer font-medium p-0"
                style={{ fontFamily: T.font }}
              >
                Ред.
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteRole(card.id);
                }}
                className="text-[11px] text-red-500 hover:text-red-400 bg-transparent border-0 cursor-pointer font-medium p-0"
                style={{ fontFamily: T.font }}
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
