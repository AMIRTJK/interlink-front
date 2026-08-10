import { motion } from "framer-motion";
import { Dropdown } from "antd";
import { MoreHorizontal, CornerUpLeft, Activity } from "lucide-react";
import { If, Tooltip } from "@shared/ui";
import { cn } from "@shared/lib";
import { getLetterTypeName } from "@widgets/RegistryTable/lib/getCorrespondenceLinkTypeLabel";
import { PeopleViewer } from "../PeopleViewer";
import { getLinkTypeInfo, getLetterStatusBadge } from "./letterStatus";
import { getBadgeStyles } from "./badgeStyles";

// --- LIST VIEW (UPDATED WITH fieldConfig) ---
export const DocumentListItem = ({
  data,
  statusData,
  _index,
  onClick,
  activeStatusData,
  fieldConfig,
  isHighlighted,
}: any) => {
  // Получаем действия
  const actionItems = fieldConfig?.getActions
    ? fieldConfig.getActions(data)
    : [];
  const linkInfo = getLinkTypeInfo(data, fieldConfig?.isIncoming);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.1,
        ease: [0.4, 0, 0.2, 1],
      }}
      whileHover={{ x: 4, boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.1)" }}
      onClick={onClick}
      className={cn(
        "ui-glass bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 transition-all duration-500 cursor-pointer mb-2 overflow-hidden relative",
        linkInfo?.borderColor,
      )}
    >
      <If is={Boolean(isHighlighted)}>
        <div className="absolute inset-0 rounded-lg ring-2 ring-inset ring-blue-500 border border-blue-500 pointer-events-none z-20 shadow-[0_0_15px_rgba(59,130,246,0.45)] transition-all duration-500" />
      </If>
      <div className="p-4">
        <div className="flex items-center gap-4">
          {/* Status Icon */}
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className={`flex-shrink-0 p-2.5 rounded-lg bg-gradient-to-r ${
              statusData?.gradient ||
              activeStatusData?.gradient ||
              "from-gray-100 to-gray-200"
            }`}
          >
            {(statusData?.icon || activeStatusData?.icon) && (
              <div className="text-white">
                {statusData?.icon || activeStatusData?.icon}
              </div>
            )}
          </motion.div>

          {/* Document Info Grid */}
          <div className="flex-1 flex items-center gap-4 min-w-0">
            {/* ID & Date */}
            <div className="w-[76px] flex-shrink-0">
              <div className="text-xs text-gray-500 dark:text-slate-400 mb-0.5 whitespace-nowrap">
                № {data.id}
              </div>
              <div className="text-xs font-medium text-gray-700 dark:text-slate-300 whitespace-nowrap">
                {new Date(data.created_at).toLocaleDateString("ru-RU")}
              </div>
            </div>

            {/* Subject */}
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500 dark:text-slate-400 mb-0.5 flex items-center gap-1.5 whitespace-nowrap">
                <span>Тема</span>
                <If is={!!linkInfo}>
                  <Tooltip title={linkInfo?.label}>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold flex-shrink-0",
                        linkInfo?.badgeClass,
                      )}
                    >
                      {linkInfo?.icon}
                      <span>
                        {linkInfo?.isReply ? "Отвечено" : "Переслано"}
                      </span>
                    </span>
                  </Tooltip>
                </If>
              </div>
              <div
                className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate"
                title={data.subject}
              >
                {data.subject}
              </div>
            </div>

            {/* Тип письма (сразу после столбца Тема — только для Входящих) */}
            <If is={!!fieldConfig?.isIncoming}>
              <div className="w-[112px] flex-shrink-0 overflow-hidden">
                <div className="flex items-center gap-1 mb-0.5 text-gray-400 dark:text-slate-500 whitespace-nowrap">
                  <CornerUpLeft size={10} className="flex-shrink-0" />
                  <span className="text-xs text-gray-500 dark:text-slate-400 whitespace-nowrap">
                    Тип письма
                  </span>
                </div>
                <div
                  className={`text-xs font-mono font-semibold px-2 py-1 rounded truncate ${getBadgeStyles(
                    "purple",
                  )}`}
                >
                  {getLetterTypeName(data)}
                </div>
              </div>
            </If>

            {/* DYNAMIC PRIMARY */}
            {fieldConfig?.primary && (
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 dark:text-slate-400 mb-0.5 whitespace-nowrap">
                  {fieldConfig.primary.label}
                </div>
                <div
                  className="text-sm text-gray-900 dark:text-slate-100 font-medium truncate"
                  title={String(fieldConfig.primary.render(data))}
                >
                  {fieldConfig.primary.render(data)}
                </div>
              </div>
            )}

            {/* DYNAMIC SECONDARY */}
            {fieldConfig?.secondary && (
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 dark:text-slate-400 mb-0.5 whitespace-nowrap">
                  {fieldConfig.secondary.label}
                </div>
                <div className="text-sm text-gray-900 dark:text-slate-100 font-medium truncate">
                  {fieldConfig.secondary.render(data)}
                </div>
              </div>
            )}
          </div>

          {/* Right Side: Status + Actions */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Бейджи-колонки (Дата / Рег. № / Тип письма / Мой статус) —
						    равномерно, с отступами как у столбца «Статус письма». */}
            {fieldConfig?.badges?.map((badge: any, i: number) => {
              const style = getBadgeStyles(badge.color);
              return (
                <div
                  key={`badge-${i}`}
                  className="w-[112px] flex-shrink-0 overflow-hidden"
                >
                  <div className="flex items-center gap-1 mb-0.5 text-gray-400 dark:text-slate-500 whitespace-nowrap">
                    {badge.icon}
                    <span className="text-xs text-gray-500 dark:text-slate-400 truncate">
                      {badge.label}
                    </span>
                  </div>
                  <div
                    className={`text-xs font-mono font-semibold px-2 py-1 rounded truncate ${style}`}
                  >
                    {badge.render(data)}
                  </div>
                </div>
              );
            })}

            {/* Колонки-списки пользователей (Ответили / Переслали /
						    Ознакомились) — равномерно, каждая открывает окно по клику. */}
            {fieldConfig?.people?.map((col: any) => (
              <div
                key={col.key}
                className="w-[112px] flex-shrink-0 overflow-hidden"
              >
                <div className="flex items-center gap-1 mb-0.5 text-gray-400 dark:text-slate-500 whitespace-nowrap">
                  {col.icon}
                  <span className="text-xs text-gray-500 dark:text-slate-400 truncate">
                    {col.label}
                  </span>
                </div>
                <div className="text-sm font-medium">
                  <PeopleViewer
                    label={col.label}
                    avatarBg={col.avatarBg}
                    users={col.getUsers(data)}
                  />
                </div>
              </div>
            ))}

            {/* Статус письма */}
            {(() => {
              const statusBadge = getLetterStatusBadge(
                data,
                fieldConfig?.isIncoming,
              );
              return (
                <div className="w-[112px] flex-shrink-0 overflow-hidden">
                  <div className="flex items-center gap-1 mb-0.5 whitespace-nowrap">
                    <Activity
                      size={12}
                      className="text-gray-400 dark:text-slate-500 flex-shrink-0"
                    />
                    <span className="text-xs text-gray-500 dark:text-slate-400 truncate">
                      Статус письма
                    </span>
                  </div>
                  <div
                    className={`text-xs font-mono font-semibold px-2 py-1 rounded truncate ${getBadgeStyles(
                      statusBadge.color,
                    )}`}
                  >
                    {statusBadge.label}
                  </div>
                </div>
              );
            })()}


            {/* Action Menu List View */}
            {actionItems.length > 0 && (
              <div onClick={(e) => e.stopPropagation()}>
                <Dropdown
                  menu={{ items: actionItems }}
                  trigger={["click"]}
                  placement="bottomRight"
                  overlayClassName="custom-registry-dropdown"
                >
                  <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md text-gray-500 dark:text-slate-400 transition-colors">
                    <MoreHorizontal size={16} />
                  </button>
                </Dropdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
