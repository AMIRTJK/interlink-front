import "./style.css";

import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import "dayjs/locale/ru";

import { motion, AnimatePresence } from "framer-motion";
import { EmptyState } from "@shared/ui";
import { useLocation } from "react-router";
import { tokenControl } from "@shared/lib";
import { StructureView } from "./StructureView";
import type { LetterDirection } from "../lib/structure/types";
import type {
  RegistryLayoutProps,
  ViewMode,
} from "./registryLayout/registryLayoutModel";
import { getEffectiveStatusData } from "./registryLayout/letterStatus";
import { RegistryHeaderBar } from "./registryLayout/RegistryHeaderBar";
import { DocumentCard } from "./registryLayout/DocumentCard";
import { DocumentListItem } from "./registryLayout/DocumentListItem";
import { FilterDrawer } from "./registryLayout/FilterDrawer";
import { Pagination } from "./registryLayout/Pagination";

export {
  getLetterStatusBadge,
  getEffectiveStatusData,
} from "./registryLayout/letterStatus";
export { SectionHeader } from "./registryLayout/SectionHeader";
export { DocumentCard } from "./registryLayout/DocumentCard";
export { DocumentListItem } from "./registryLayout/DocumentListItem";

dayjs.locale("ru");

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
  onVersionClick,
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

  const location = useLocation();
  const { pathname } = location;
  const rawHighlightedId = (location.state as any)?.highlightedId;
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    if (rawHighlightedId) {
      setHighlightedId(String(rawHighlightedId));
      window.history.replaceState(null, "");
      const timer = setTimeout(() => {
        setHighlightedId(null);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [rawHighlightedId]);

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
      <RegistryHeaderBar
        createButtonText={createButtonText}
        totalRecords={totalRecords}
        showFrom={showFrom}
        showTo={showTo}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        hasActiveFilters={hasActiveFilters}
        onOpenFilters={() => setIsFilterOpen(true)}
        ripples={ripples}
        onCreateClick={handleCreateClick}
        isStatusNavActive={isStatusNavActive}
        tabs={tabs}
        activeTabId={activeTabId}
        onTabChange={onTabChange}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTabId + currentPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col gap-6"
        >

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
                    onVersionClick={onVersionClick}
                    highlightedId={highlightedId}
                  />
                ) : documents && documents.length > 0 ? (
                  documents?.map((doc: any, idx: number) => {
                    const statusData = getEffectiveStatusData(
                      doc,
                      statusConfig,
                      fieldConfig?.isIncoming,
                    );

                    const isHighlighted =
                      !!highlightedId &&
                      String(doc.id) === String(highlightedId);

                    const props = {
                      key: doc.id,
                      data: doc,
                      statusData,
                      index: idx,
                      onClick: () => onCardClick(doc.id),
                      activeStatusData: activeTab,
                      fieldConfig,
                      isHighlighted,
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
            <div className="ui-glass shrink-0 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-2">
              <Pagination
                currentPage={currentPage}
                totalPages={lastPage}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Набор фильтров зависит от вкладки, поэтому пересоздаём панель при её
          смене — иначе внутреннее состояние полей остаётся от прошлой вкладки. */}
      <FilterDrawer
        key={activeTabId}
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
