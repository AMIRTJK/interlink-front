import "./style.css";

import React, { useMemo, useState } from "react";
import locale from "antd/es/locale/ru_RU";
import dayjs from "dayjs";
import "dayjs/locale/ru";

import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  LayoutGrid,
  List,
  TrendingUp,
  Filter,
  MoreHorizontal,
  FileType,
  FileText,
  ChevronDown,
  User,
  Mail,
  X,
  RotateCcw,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Activity,
  CornerUpLeft,
  Forward,
  Clock,
  FileEdit,
  CheckCheck,
  XCircle,
} from "lucide-react";


import {
  ConfigProvider,
  DatePicker,
  Dropdown,
  Input,
  Select,
  theme,
} from "antd";
import {
  Breadcrumbs,
  IBreadcrumbItem,
  Count,
  If,
  EmptyState,
  Tooltip,
} from "@shared/ui";
import { cn } from "@shared/lib";
import { getLetterTypeName } from "@widgets/RegistryTable/lib/getCorrespondenceLinkTypeLabel";

const getLinkTypeInfo = (data: any, isIncoming?: boolean) => {
  if (isIncoming) return null;
  const linkType = data?.link_type || data?.relation_type;
  if (linkType === "reply") {
    return {
      isReply: true,
      label: data?.relation_label || "Ответное письмо",
      borderColor: "border-l-4! border-l-emerald-500!",
      badgeClass:
        "bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
      icon: <CornerUpLeft size={11} className="flex-shrink-0" />,
    };
  }
  if (linkType === "forward") {
    return {
      isForward: true,
      label: data?.relation_label || "Пересланное письмо",
      borderColor: "border-l-4! border-l-purple-500!",
      badgeClass:
        "bg-purple-50 text-purple-700 border border-purple-200/80 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800",
      icon: <Forward size={11} className="flex-shrink-0" />,
    };
  }
  return null;
};


export const getLetterStatusBadge = (
  doc: any,
  isIncoming?: boolean,
): { label: string; color: string } => {
  const isIncomingDoc =
    isIncoming ||
    doc?.kind === "incoming" ||
    (doc?.channel === "internal" && doc?.kind === "incoming");

  if (isIncomingDoc) {
    const assignments = Array.isArray(doc?.assignments)
      ? doc.assignments
      : Array.isArray(doc?.assignment_list)
      ? doc.assignment_list
      : doc?.assignment
      ? [doc.assignment]
      : [];

    if (assignments.length > 0) {
      const activeAssign = assignments[assignments.length - 1];
      const assignStatus = (activeAssign?.status || "").toString().toLowerCase();

      if (
        assignStatus === "pending" ||
        assignStatus === "in_progress" ||
        assignStatus === "in-progress"
      ) {
        return { label: "В процессе исполнения", color: "amber" };
      }
      if (
        assignStatus === "submitted" ||
        assignStatus === "review" ||
        assignStatus === "to_review"
      ) {
        return { label: "На проверке", color: "purple" };
      }
      if (assignStatus === "done" || assignStatus === "completed") {
        return { label: "Завершено", color: "emerald" };
      }
      if (assignStatus === "returned") {
        return { label: "На доработке", color: "rose" };
      }
      return { label: "В процессе исполнения", color: "amber" };
    }

    return { label: "Без поручения", color: "blue" };
  }

  const isSent =
    doc?.status === "sent" ||
    doc?.status === "sent_out" ||
    doc?.status === "отправлено";

  return isSent
    ? { label: "Отправлено", color: "emerald" }
    : { label: "Черновик", color: "blue" };
};

export const getEffectiveStatusData = (
  doc: any,
  statusConfig: Record<string, any>,
  isIncoming?: boolean,
) => {
  if (!doc || !statusConfig) return statusConfig?.default || {};

  const isIncomingDoc =
    isIncoming ||
    doc?.kind === "incoming" ||
    (doc?.channel === "internal" && doc?.kind === "incoming");

  if (isIncomingDoc) {
    const badge = getLetterStatusBadge(doc, true);
    if (badge.label === "В процессе исполнения") {
      return (
        statusConfig["in-progress"] ||
        statusConfig.in_progress || {
          label: "В процессе исполнения",
          gradient: "from-amber-500 to-amber-600",
          icon: <Clock size={14} />,
        }
      );
    }
    if (badge.label === "На проверке") {
      return (
        statusConfig.submitted || {
          label: "На проверке",
          gradient: "from-purple-500 to-purple-600",
          icon: <FileEdit size={14} />,
        }
      );
    }
    if (badge.label === "Завершено") {
      return (
        statusConfig.completed ||
        statusConfig.done || {
          label: "Завершено",
          gradient: "from-emerald-500 to-emerald-600",
          icon: <CheckCheck size={14} />,
        }
      );
    }
    if (badge.label === "На доработке") {
      return (
        statusConfig.returned || {
          label: "На доработке",
          gradient: "from-rose-500 to-rose-600",
          icon: <XCircle size={14} />,
        }
      );
    }
    return (
      statusConfig.no_assignment ||
      statusConfig.analysis || {
        label: "Без поручения",
        gradient: "from-blue-500 to-blue-600",
        icon: <Clock size={14} />,
      }
    );
  }

  const letterStatusRaw = (
    doc.letter_status ||
    doc.status ||
    doc.status_code ||
    ""
  )
    .toString()
    .toLowerCase();

  const isSent =
    letterStatusRaw === "sent" ||
    letterStatusRaw === "отправлено" ||
    letterStatusRaw === "sent_out";

  if (isSent) {
    return statusConfig.sent || statusConfig.default || {};
  }

  const rawMyStatus = (
    typeof doc.my_status === "string"
      ? doc.my_status
      : doc.my_status?.key ||
        doc.my_status?.primary ||
        doc.my_status?.status ||
        doc.my_status_code ||
        doc.user_status ||
        ""
  )
    .toString()
    .toLowerCase();

  let effectiveKey = "draft";

  if (
    rawMyStatus.includes("author") ||
    rawMyStatus.includes("автор") ||
    rawMyStatus.includes("draft") ||
    rawMyStatus.includes("черновик")
  ) {
    effectiveKey = "draft";
  } else if (
    rawMyStatus.includes("approve") ||
    rawMyStatus.includes("согласован")
  ) {
    if (
      rawMyStatus === "approved" ||
      rawMyStatus === "согласован" ||
      rawMyStatus === "согласовано"
    ) {
      effectiveKey = "approved";
    } else {
      effectiveKey = "to_approve";
    }
  } else if (rawMyStatus.includes("sign") || rawMyStatus.includes("подпис")) {
    if (
      rawMyStatus === "signed" ||
      rawMyStatus === "подписан" ||
      rawMyStatus === "подписано"
    ) {
      effectiveKey = "signed";
    } else {
      effectiveKey = "to_sign";
    }
  } else if (rawMyStatus && statusConfig[rawMyStatus]) {
    effectiveKey = rawMyStatus;
  } else if (letterStatusRaw && statusConfig[letterStatusRaw]) {
    effectiveKey = letterStatusRaw;
  }

  return (
    statusConfig[effectiveKey] ||
    statusConfig.draft ||
    statusConfig.default ||
    {}
  );
};


import { useLocation } from "react-router";
import { tokenControl } from "@shared/lib";
import { StructureView } from "./StructureView";
import { PeopleViewer } from "./PeopleViewer";
import type { LetterDirection } from "../lib/structure/types";

type ViewMode = "list" | "block" | "structure";

dayjs.locale("ru");

// Хелпер для цветов бейджей (Tailwind)
const getBadgeStyles = (color: string) => {
  switch (color) {
    case "blue":
      return "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300";
    case "emerald":
      return "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300";
    case "purple":
      return "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300";
    case "amber":
      return "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300";
    case "rose":
      return "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300";
    default:
      return "bg-gray-50 text-gray-600 dark:bg-slate-700/50 dark:text-slate-300";
  }
};

// Цвет бейджа «Статус письма» по статусу документа (в стиле остальных бейджей)
const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "sent":
    case "completed":
      return "emerald";
    case "signed":
      return "purple";
    case "in-progress":
    case "to_approve":
    case "to_sign":
      return "amber";
    case "canceled":
      return "rose";
    case "draft":
    case "analysis":
    case "approved":
      return "blue";
    default:
      return "gray";
  }
};

// Компонент эффекта волны (Ripple)
const RippleEffect = ({ x, y }: { x: number; y: number }) => (
  <motion.span
    initial={{ scale: 0, opacity: 0.5 }}
    animate={{ scale: 2.5, opacity: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: 100,
      height: 100,
      borderRadius: "50%",
      backgroundColor: "rgba(255, 255, 255, 0.4)",
      transform: "translate(-50%, -50%)",
      pointerEvents: "none",
    }}
  />
);

interface RegistryLayoutProps {
  documents: any[];
  meta: any;
  tabs: any[];
  activeTabId: string;
  createButtonText?: string;
  onTabChange: (id: string) => void;
  onPageChange: (page: number) => void;
  onFilterApply: (filters: any) => void;
  onFilterReset: () => void;
  onCardClick: (id: number) => void;
  onCreate: () => void;
  currentFilters: any;
  statusConfig: any;
  fieldConfig: any; // Наш конфиг полей и действий
  breadcrumbs?: IBreadcrumbItem[]; // Крошки для навигации
}

export const RegistryLayout = ({
  documents,
  meta,
  tabs,
  activeTabId,
  createButtonText,
  onTabChange,
  onPageChange,
  onFilterApply,
  onFilterReset,
  onCardClick,
  onCreate,
  currentFilters,
  statusConfig,
  fieldConfig,
  breadcrumbs,
}: RegistryLayoutProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const savedMode = tokenControl.getViewMode();
    return (savedMode as ViewMode) || "list";
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { pathname } = useLocation();

  const isStatusNavActive =
    pathname.includes("incoming") || pathname.includes("outgoing");

  // Направление письма для реконструкции цепочки движения в режиме «Структура».
  const direction: LetterDirection = pathname.includes("incoming")
    ? "incoming"
    : "outgoing";

  // --- ДАННЫЕ ИЗ API (META) ---
  const currentPage = meta?.current_page || 1;
  const lastPage = meta?.last_page || 1;
  const totalRecords = meta?.total || 0;
  const perPage = meta?.per_page || 15;

  const showFrom = meta?.from || (currentPage - 1) * perPage;
  const showTo = meta?.to || showFrom + (documents?.length || 0);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  // Состояние для эффекта Ripple
  const [ripples, setRipples] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);

  const hasActiveFilters = Object.values(currentFilters).some((v) => !!v);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    tokenControl.setViewMode(mode);
  };

  const handleCreateClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
    onCreate();
  };

  return (
    <div
      className={`w-full h-full space-y-4 flex flex-col gap-6 overflow-hidden`}
    >
      {/* --- HEADER BLOCK --- */}
      <motion.div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-3 space-y-3 shrink-0 m-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between gap-3">
          {createButtonText && (
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.3)",
              }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCreateClick}
              className="relative cursor-pointer flex items-center gap-2 px-6 py-2 overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold text-sm shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
            >
              <AnimatePresence>
                {ripples.map((ripple) => (
                  <RippleEffect key={ripple.id} x={ripple.x} y={ripple.y} />
                ))}
              </AnimatePresence>
              <Plus className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{createButtonText}</span>
              <motion.div
                className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ["-100%", "200%"] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1,
                  ease: "easeInOut",
                }}
              />
            </motion.button>
          )}

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-slate-300 px-3 py-1.5 bg-gray-50 dark:bg-slate-700/50 rounded-full">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-medium">
                Всего:{" "}
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  {totalRecords}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-700/50 rounded-lg p-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleViewModeChange("list")}
                className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === "list"
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100"
                }`}
              >
                <List size={16} />
                <span>Список</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleViewModeChange("block")}
                className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === "block"
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100"
                }`}
              >
                <LayoutGrid size={16} />
                <span>Блоки</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleViewModeChange("structure")}
                className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === "structure"
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100"
                }`}
              >
                <Activity size={16} />
                <span>Структура</span>
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFilterOpen(true)}
              className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
                hasActiveFilters
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-600"
              }`}
            >
              <Filter size={16} />
              <span>Фильтры</span>
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800" />
              )}
            </motion.button>
          </div>
        </div>

        <If is={isStatusNavActive}>
          <div className="flex items-center gap-2 pb-1 scrollbar-hide flex-wrap">
            {tabs?.map((tab, index) => (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                data-active={activeTabId === tab.id}
                className={`relative group/tab cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all whitespace-nowrap min-w-[108px] ${
                  activeTabId === tab.id
                    ? "text-white"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}
              >
                <If is={activeTabId === tab.id}>
                  <motion.div
                    layoutId="active-status-bg"
                    className={`absolute inset-0 rounded-full bg-linear-to-r ${tab.gradient} shadow-md`}
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                </If>
                <span className="relative z-10 flex items-center justify-center">
                  <span
                    className={`flex items-center justify-center ${
                      activeTabId !== tab.id ? "opacity-70" : ""
                    }`}
                  >
                    {tab.icon}
                  </span>
                </span>
                <span className="relative z-10">{tab.label}</span>
                <Count
                  count={tab.count}
                  showZero
                  animate={false}
                  variant="red"
                  className="absolute -top-1.5 -right-1.5 shadow-xs transition-colors z-20"
                />
              </motion.button>
            ))}
          </div>
        </If>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTabId + currentPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col gap-6"
        >
          {tabs.length > 0 && (
            <SectionHeader
              activeStatusData={activeTab}
              t={{ total: "Всего", documents: "документов", shown: "Показано" }}
              currentDocuments={documents}
              startIndex={showFrom - 1}
              endIndex={showTo}
              breadcrumbs={breadcrumbs}
            />
          )}

          {/* --- CONTENT AREA --- */}
          <div className="flex-1 min-h-0 pr-1 m-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode + activeTabId + currentPage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={
                  viewMode === "block"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4"
                    : viewMode === "structure"
                      ? ""
                      : "space-y-2"
                }
              >
                {viewMode === "structure" ? (
                  <StructureView
                    documents={documents}
                    direction={direction}
                    onCardClick={onCardClick}
                  />
                ) : documents && documents.length > 0 ? (
                  documents?.map((doc: any, idx: number) => {
                    const statusData = getEffectiveStatusData(
                      doc,
                      statusConfig,
                      fieldConfig?.isIncoming,
                    );

                    const props = {
                      key: doc.id,
                      data: doc,
                      statusData,
                      index: idx,
                      onClick: () => onCardClick(doc.id),
                      activeStatusData: activeTab,
                      fieldConfig,
                    };
                    return viewMode === "block" ? (
                      <DocumentCard {...props} />
                    ) : (
                      <DocumentListItem {...props} />
                    );
                  })
                ) : (
                  <EmptyState className="col-span-full" />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* --- PAGINATION --- */}
          {lastPage > 1 && (
            <div className="shrink-0 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-2">
              <Pagination
                currentPage={currentPage}
                totalPages={lastPage}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={currentFilters}
        onApply={onFilterApply}
        onReset={onFilterReset}
        configItems={fieldConfig.filters}
      />
    </div>
  );
};

// ==========================================
// ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ
// ==========================================

// --- SECTION HEADER ---

export const SectionHeader = ({
  activeStatusData,
  t,
  currentDocuments,
  startIndex,
  endIndex,
  breadcrumbs,
}: any) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 m-0 flex flex-col gap-2">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} className="py-0 mb-1" />
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={`p-2 rounded-lg bg-gradient-to-r ${
              activeStatusData?.gradient || "from-blue-50 to-blue-100"
            }`}
          >
            {activeStatusData?.icon ? (
              <div className="text-white">{activeStatusData.icon}</div>
            ) : (
              <FileText size={18} className="text-blue-600" />
            )}
          </motion.div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-slate-100">
              <span
                className={`bg-gradient-to-r bg-clip-text text-transparent ${
                  activeStatusData?.gradient || "from-gray-700 to-gray-900"
                }`}
              >
                {activeStatusData?.label || "Все документы"}
              </span>
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {t?.total || "Всего"} {t?.documents || "документов"}:{" "}
              {currentDocuments?.length || 0} | {t?.shown || "Показано"}:{" "}
              {startIndex + 1}-{endIndex}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- CARD VIEW (UPDATED WITH fieldConfig) ---
export const DocumentCard = ({
  data,
  statusData,
  _index,
  onClick,
  activeStatusData,
  fieldConfig,
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
        "bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden hover:border-blue-300 dark:hover:border-blue-500 transition-all cursor-pointer group flex flex-col justify-between relative",
        linkInfo?.borderColor,
      )}
    >
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

// --- LIST VIEW (UPDATED WITH fieldConfig) ---
export const DocumentListItem = ({
  data,
  statusData,
  _index,
  onClick,
  activeStatusData,
  fieldConfig,
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
        "bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 transition-all duration-300 cursor-pointer mb-2 overflow-hidden",
        linkInfo?.borderColor,
      )}
    >
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

// --- FILTER DRAWER ---
const FilterDrawer = ({
  isOpen,
  onClose,
  filters,
  onApply,
  onReset,
  configItems = [],
}: any) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const glassTheme = {
    algorithm: theme.darkAlgorithm,
    token: {
      colorBgContainer: "rgba(255, 255, 255, 0.1)",
      colorBorder: "rgba(255, 255, 255, 0.2)",
      colorText: "#ffffff",
      colorTextPlaceholder: "rgba(255, 255, 255, 0.5)",
      controlHeight: 40,
      borderRadius: 8,
      colorPrimary: "#ffffff",
    },
    components: {
      Select: {
        selectorBg: "rgba(255, 255, 255, 0.1)",
        optionSelectedBg: "rgba(255, 255, 255, 0.2)",
      },
    },
  };

  const handleChange = (key: string, value: any) => {
    setLocalFilters((prev: any) => {
      const next = { ...prev };
      // Если значение пустое/null/undefined - удаляем ключ, чтобы Antd сбросил поле
      if (value === null || value === undefined || value === "") {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleResetClick = () => {
    setLocalFilters({});

    // Create a complete clear object with ALL possible keys set to null
    const clearedFilters: Record<string, any> = {};

    // 1. Add current local keys to be cleared
    Object.keys(localFilters).forEach((key) => {
      clearedFilters[key] = null;
    });

    // 2. Add keys from config to be absolutely sure
    configItems.forEach((item: any) => {
      clearedFilters[item.name] = null;
      if (item.rangeNames) {
        clearedFilters[item.rangeNames[0]] = null;
        clearedFilters[item.rangeNames[1]] = null;
      }
    });

    onApply(clearedFilters); // Send 'null' values to clear params
    onReset(); // Trigger standard reset (optional but good for side effects)
    onClose();
  };

  const getIcon = (name: string) => {
    const iconClass = "w-4 h-4 text-blue-200/60 mr-1";
    if (name.toLowerCase().includes("incoming"))
      return <Mail className={iconClass} />;
    if (name.toLowerCase().includes("outgoing"))
      return <Search className={iconClass} />;
    if (name.toLowerCase().includes("sender"))
      return <User className={iconClass} />;
    return <Filter className={iconClass} />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 m-0"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-br from-[#0047AB] via-[#0052CC] to-[#0047AB] shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* ... (Header и Background остаются без изменений) ... */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ["-100%", "200%"] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1,
                  ease: "easeInOut",
                }}
              />
            </div>

            <div className="relative flex items-center justify-between px-6 h-16 border-b border-white/10 backdrop-blur-sm flex-shrink-0">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Filter className="w-5 h-5 text-white/80" />
                </motion.div>
                <h3 className="text-white font-semibold text-lg">
                  Фильтр документов
                </h3>
                <AnimatePresence>
                  {Object.values(localFilters).some((v) => !!v) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="px-2 py-1 bg-white/20 rounded-full text-xs text-white font-medium"
                    >
                      Активно
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="text-white/80 hover:text-white cursor-pointer transition-colors p-2 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Filter Controls (ANTD + DYNAMIC) */}
            <ConfigProvider theme={glassTheme} locale={locale}>
              <div className="relative p-6 space-y-4 flex-1 overflow-y-auto min-h-0">
                <motion.div
                  className="space-y-4"
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: { opacity: 0 },
                    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
                  }}
                >
                  {configItems.map((item: any, index: number) => {
                    const isDate = item.type === "date";
                    const isDateRange =
                      item.type === "date_range" || item.type === "date-range";
                    const isSelect = item.type === "select";
                    const isInput = item.type === "input" || !item.type;

                    return (
                      <motion.div
                        key={index}
                        variants={{
                          hidden: { opacity: 0, x: 50 },
                          show: { opacity: 1, x: 0 },
                        }}
                      >
                        <label className="text-white/80 text-sm font-medium mb-2 block">
                          {item.label}
                        </label>

                        {isInput && (
                          <Input
                            placeholder={item.placeholder}
                            prefix={getIcon(item.name)}
                            value={localFilters[item.name]} // undefined сбросит поле
                            onChange={(e) =>
                              handleChange(item.name, e.target.value)
                            }
                            allowClear
                            className="backdrop-blur-sm [&_input::placeholder]:text-blue-100/50! [&_input::placeholder]:text-sm! transition-colors! focus-within:shadow-none! focus-within:border-[#e8e8e8]!"
                          />
                        )}

                        {isSelect && (
                          <Select
                            placeholder={item.placeholder}
                            value={localFilters[item.name] || undefined} // undefined для сброса
                            onChange={(val) => handleChange(item.name, val)}
                            options={item.options}
                            allowClear
                            className="w-full backdrop-blur-sm [--ant-select-active-outline-color:transparent]!"
                            suffixIcon={
                              <ChevronDown className="w-4 h-4 text-white/60" />
                            }
                          />
                        )}

                        {isDate && (
                          <DatePicker
                            className="w-full backdrop-blur-sm [&.ant-picker-focused]:border-[#e8e8e8]! [&.ant-picker-focused]:shadow-none!"
                            placeholder={item.placeholder}
                            value={
                              localFilters[item.name]
                                ? dayjs(localFilters[item.name])
                                : null // null сбросит поле
                            }
                            onChange={
                              (date, dateString) =>
                                handleChange(item.name, dateString) // dateString будет пустой строкой при очистке
                            }
                            suffixIcon={
                              <Calendar className="w-4 h-4 text-blue-200/60" />
                            }
                          />
                        )}

                        {isDateRange && (
                          <DatePicker.RangePicker
                            className="w-full backdrop-blur-sm [&.ant-picker-focused]:border-[#e8e8e8]! [&.ant-picker-focused]:shadow-none!"
                            placeholder={
                              Array.isArray(item.placeholder)
                                ? item.placeholder
                                : ["С даты", "По дату"]
                            }
                            value={
                              localFilters[item.rangeNames?.[0]] &&
                              localFilters[item.rangeNames?.[1]]
                                ? [
                                    dayjs(localFilters[item.rangeNames[0]]),
                                    dayjs(localFilters[item.rangeNames[1]]),
                                  ]
                                : null // Сброс при отсутствии дат
                            }
                            onChange={(dates, dateStrings) => {
                              if (item.rangeNames) {
                                setLocalFilters((prev: any) => {
                                  const next = { ...prev };
                                  if (!dates) {
                                    // Сброс
                                    delete next[item.rangeNames[0]];
                                    delete next[item.rangeNames[1]];
                                  } else {
                                    next[item.rangeNames[0]] = dateStrings[0];
                                    next[item.rangeNames[1]] = dateStrings[1];
                                  }
                                  return next;
                                });
                              }
                            }}
                            suffixIcon={
                              <Calendar className="w-4 h-4 text-blue-200/60" />
                            }
                            separator={<span className="text-white/40">→</span>}
                            allowClear
                          />
                        )}
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            </ConfigProvider>

            {/* Footer Actions */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10 bg-black/10">
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleResetClick} // Используем новую функцию сброса
                  className="flex-1 flex items-center cursor-pointer justify-center gap-2 h-11 px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 hover:border-white/30 transition-all text-sm font-medium backdrop-blur-sm"
                >
                  <motion.div
                    whileHover={{ rotate: -180 }}
                    transition={{ duration: 0.5 }}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </motion.div>
                  Сбросить
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleApply}
                  className="flex-1 flex items-center cursor-pointer justify-center gap-2 h-11 px-4 bg-white hover:bg-white/90 text-blue-600 rounded-lg font-semibold text-sm transition-all shadow-lg"
                >
                  <Filter className="w-4 h-4" />
                  Применить
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- PAGINATION (Updated) ---
const Pagination = ({ currentPage, totalPages, onPageChange, t }: any) => {
  const texts = t || { back: "Назад", forward: "Вперед" };
  const current = Number(currentPage);

  const pages = useMemo(() => {
    const delta = 2;
    const range = [];
    const rangeWithDots: (number | string)[] = [];
    let l;

    range.push(1);

    if (totalPages <= 1) return [1];

    for (let i = current - delta; i <= current + delta; i++) {
      if (i < totalPages && i > 1) {
        range.push(i);
      }
    }
    range.push(totalPages);

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  }, [current, totalPages]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center gap-2 py-4"
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(current - 1)}
        disabled={current === 1}
        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
          current === 1
            ? "bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600 cursor-not-allowed"
            : "bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 border border-gray-200 dark:border-slate-700 cursor-pointer"
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">{texts.back}</span>
      </motion.button>

      <div className="flex items-center gap-1">
        {pages.map((page: any, index: any) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-gray-400 dark:text-slate-500"
              >
                ...
              </span>
            );
          }
          const pageNum = Number(page);
          const isActive = pageNum === current;

          return (
            <motion.button
              key={pageNum}
              whileHover={{ scale: isActive ? 1 : 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange(pageNum)}
              className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-linear-to-r from-blue-600 to-blue-700 text-white shadow-md"
                  : "bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700"
              }`}
            >
              {pageNum}
            </motion.button>
          );
        })}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(current + 1)}
        disabled={current === totalPages}
        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
          current === totalPages
            ? "bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600 cursor-not-allowed"
            : "bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 border border-gray-200 dark:border-slate-700 cursor-pointer"
        }`}
      >
        <span className="hidden sm:inline">{texts.forward}</span>
        <ChevronRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
};
