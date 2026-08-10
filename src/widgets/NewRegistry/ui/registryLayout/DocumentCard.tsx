import { motion } from "framer-motion";
import { Dropdown } from "antd";
import { MoreHorizontal, FileType } from "lucide-react";
import { If, Tooltip } from "@shared/ui";
import { cn } from "@shared/lib";
import { PeopleViewer } from "../PeopleViewer";
import { HighlightOverlay } from "./HighlightOverlay";
import { getLinkTypeInfo } from "./letterStatus";
import { getBadgeStyles } from "./badgeStyles";

// --- CARD VIEW (UPDATED WITH fieldConfig) ---
export const DocumentCard = ({
  data,
  statusData,
  _index,
  onClick,
  activeStatusData,
  fieldConfig,
  isHighlighted,
}: any) => {
  // Получаем действия (меню) для этой записи
  const actionItems = fieldConfig?.getActions
    ? fieldConfig.getActions(data)
    : [];
  const linkInfo = getLinkTypeInfo(data, fieldConfig?.isIncoming);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.15)" }}
      onClick={onClick}
      className={cn(
        "ui-glass bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-500 cursor-pointer group flex flex-col justify-between relative overflow-hidden",
        linkInfo?.borderColor,
      )}
    >
      <HighlightOverlay isHighlighted={Boolean(isHighlighted)} rounded="xl" />
      {/* Header */}
      <div
        className={`p-3 bg-gradient-to-r ${
          statusData?.gradient ||
          activeStatusData?.gradient ||
          "from-gray-100 to-gray-200"
        } flex justify-between items-center`}
      >
        <div className="flex items-center gap-2 text-white">
          <div className="p-1.5 bg-white/20 rounded-md backdrop-blur-sm">
            {statusData?.icon || activeStatusData?.icon}
          </div>
          <div>
            <div className="text-xs font-medium opacity-90">ID: {data.id}</div>
            <div className="text-white font-semibold text-sm">
              {statusData?.label || activeStatusData?.label}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Дата */}
          <div className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] text-white font-medium">
            {new Date(data.created_at).toLocaleDateString("ru-RU")}
          </div>

          {/* Actions Dropdown */}
          {actionItems.length > 0 && (
            <div onClick={(e) => e.stopPropagation()}>
              <Dropdown
                menu={{ items: actionItems }}
                trigger={["click"]}
                placement="bottomRight"
                overlayClassName="custom-registry-dropdown"
              >
                <button className="p-1 hover:bg-white/20 rounded-md text-white transition-colors">
                  <MoreHorizontal size={16} />
                </button>
              </Dropdown>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <div>
          <div className="flex items-center justify-between gap-1.5 mb-1 text-gray-400 dark:text-slate-500">
            <div className="flex items-center gap-1">
              <FileType size={12} />
              <span className="text-[10px] uppercase font-bold tracking-wider">
                Тема
              </span>
            </div>
            <If is={!!linkInfo}>
              <Tooltip title={linkInfo?.label}>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold",
                    linkInfo?.badgeClass,
                  )}
                >
                  {linkInfo?.icon}
                  <span>{linkInfo?.isReply ? "Отвечено" : "Переслано"}</span>
                </span>
              </Tooltip>
            </If>
          </div>
          <p className="text-sm font-semibold text-gray-800 dark:text-slate-100 line-clamp-2 leading-tight">
            {data.subject}
          </p>
        </div>

        {/* DYNAMIC FIELDS FROM CONFIG */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {fieldConfig?.primary && (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-gray-400 dark:text-slate-500">
                {fieldConfig.primary.icon}
                <span>{fieldConfig.primary.label}</span>
              </div>
              <div
                className="font-medium text-gray-700 dark:text-slate-200 truncate"
                title={String(fieldConfig.primary.render(data))}
              >
                {fieldConfig.primary.render(data)}
              </div>
            </div>
          )}

          {fieldConfig?.secondary && (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-gray-400 dark:text-slate-500">
                {fieldConfig.secondary.icon}
                <span>{fieldConfig.secondary.label}</span>
              </div>
              <div className="font-medium text-gray-700 dark:text-slate-200 truncate">
                {fieldConfig.secondary.render(data)}
              </div>
            </div>
          )}
        </div>

        {/* DYNAMIC BADGES */}
        {fieldConfig?.badges && fieldConfig.badges.length > 0 && (
          <div className="pt-3 border-t border-gray-100 dark:border-slate-700 flex gap-2">
            {fieldConfig.badges.map((badge: any, i: number) => {
              const style = getBadgeStyles(badge.color);
              return (
                <div
                  key={i}
                  className={`flex-1 rounded p-1.5 ${style.split(" ")[0]} bg-opacity-50`}
                >
                  <div
                    className={`flex items-center gap-1 mb-0.5 ${style.split(" ")[1]}`}
                  >
                    {badge.icon}
                    <span className="text-[10px]">{badge.label}</span>
                  </div>
                  <div className="text-xs font-mono font-semibold text-gray-700 dark:text-slate-200">
                    {badge.render(data)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PEOPLE COLUMNS (списки пользователей с окном по клику) */}
        {fieldConfig?.people && fieldConfig.people.length > 0 && (
          <div className="pt-3 mt-1 border-t border-gray-100 dark:border-slate-700 flex gap-2">
            {fieldConfig.people.map((col: any) => (
              <div key={col.key} className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-0.5 text-gray-400 dark:text-slate-500">
                  {col.icon}
                  <span className="text-[10px] text-gray-500 dark:text-slate-400">
                    {col.label}
                  </span>
                </div>
                <div className="text-xs font-medium">
                  <PeopleViewer
                    label={col.label}
                    avatarBg={col.avatarBg}
                    users={col.getUsers(data)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
