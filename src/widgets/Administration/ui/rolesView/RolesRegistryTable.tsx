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
  const thClass =
    "px-3 h-11 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap text-left";
  return (
    <div className="bg-white dark:bg-slate-900/80 rounded-[10px] border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-xs">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800/70">
            <th className={`${thClass} w-8 pl-4 pr-2`} />
            <th className={`${thClass} pl-2`}>Название роли</th>
            <th className={thClass}>Описание</th>
            <th className={thClass}>Пользователей</th>
            <th className={thClass}>Разрешений</th>
            <th className={thClass}>Дата создания</th>
            <th className={`${thClass} text-center pr-4`}>Действия</th>
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
                className="h-12 border-b border-slate-100 dark:border-slate-800/80 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                style={{
                  background: isSelected ? `${borderColor}14` : undefined,
                  borderLeft: `4px solid ${borderColor}`,
                }}
              >
                <td className="pl-3 pr-2 align-middle w-8">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ background: borderColor }}
                  />
                </td>
                <td className="pl-2 pr-3 align-middle">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: borderColor }}
                  >
                    {card.name}
                  </span>
                </td>
                <td className="px-3 align-middle max-w-[220px]">
                  <span className="text-[13px] text-slate-500 dark:text-slate-400 truncate block max-w-[200px]">
                    {card.description}
                  </span>
                </td>
                <td className="px-3 align-middle">
                  <span
                    style={{
                      background: `${borderColor}14`,
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
                <td className="px-3 align-middle">
                  <span className="text-[13px] text-slate-500 dark:text-slate-400">
                    {permCount} разрешений
                  </span>
                </td>
                <td className="px-3 align-middle">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {card.createdAt}
                  </span>
                </td>
                <td
                  className="pl-3 pr-4 align-middle text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => onCardClick(card.id)}
                      title="Редактировать"
                      className="w-7 h-7 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer flex items-center justify-center p-0"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      title="Удалить"
                      onClick={() => onDeleteRole(card.id)}
                      className="w-7 h-7 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer flex items-center justify-center p-0"
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
