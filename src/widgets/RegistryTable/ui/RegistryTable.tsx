import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./style.css";
import { Button, If, UniversalTable } from "@shared/ui";
import AddIcon from "../../../assets/icons/add-icon.svg";
import { useRegistryColumns, getRegistryFilters } from "../lib";
import { ApiRoutes } from "@shared/api";
import { StatusTabs } from "@features/StatusTabs";
import { BookModal } from "@widgets/BookModal";
import { MoveToFolderModal } from "@widgets/NewRegistry/ui/MoveToFolderModal";
import { CorrespondenceResponse } from "@entities/correspondence";
import { useRegistryTableState } from "./registryTable/useRegistryTableState";
import { ExpandedRowDetails } from "./registryTable/ExpandedRowDetails";

interface RegistryTableProps<T extends Record<string, unknown>> {
  data?: T[];
  isLoading?: boolean;
  type: string;
  createButtonText?: string;
  extraParams?: Record<string, unknown>;
  url?: string;
}

export const RegistryTable = <T extends Record<string, unknown>>({
  isLoading,
  createButtonText,
  type,
  extraParams,
  url = ApiRoutes.GET_CORRESPONDENCES,
}: RegistryTableProps<T>) => {
  const location = useLocation();
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

  const {
    currentTab,
    setCurrentTab,
    customTabs,
    showTabs,
    tabCounts,
    showCreateButton,
    handleCreate,
    isAllowed,
    isPending,
    folders,
    folderModalRecordId,
    setFolderModalRecordId,
    expandedRowKeys,
    setExpandedRowKeys,
    showExpandRow,
    isModalOpen,
    setIsModalOpen,
    handleOpenModal,
    handleGetIdCorrespondence,
    handleNavigateToExecution,
    handleNavigateToLetter,
  } = useRegistryTableState({ type, extraParams });

  const currentUrl = url;

  const columns = useRegistryColumns(type, (id) => setFolderModalRecordId(id));
  const filters = getRegistryFilters(type);

  return (
    <>
      <div className="bg-white flex flex-col gap-2 w-full h-full rounded-2xl overflow-hidden">
        <nav>
          <If is={showTabs}>
            <StatusTabs
              counts={tabCounts}
              activeTab={currentTab}
              onTabChange={setCurrentTab}
              items={customTabs}
            />
          </If>
        </nav>
        <div
          className={`px-2 ${isAllowed && createButtonText && showCreateButton ? "block!" : "hidden!"}`}
        >
          <Button
            onClick={handleCreate}
            ariaLabel="Добавить новое письмо"
            type="default"
            text={createButtonText}
            withIcon={true}
            loading={isLoading || isPending}
            disabled={isLoading || isPending}
            icon={AddIcon}
            iconAlt="Иконка плюс"
            className={`${" h-9! px-8.5!  text-[#0037AF]! border-[#0037AF]! rounded-lg! transition-all! hover:opacity-75!"}`}
          />
        </div>
        <div className={`${isAllowed ? "block! px-2!" : "hidden!"}`}>
          <UniversalTable
            url={currentUrl}
            filters={filters}
            columns={columns}
            className="[&_.ant-table-cell]:rounded-none! [&_.ant-pagination]:px-4! [&_.ant-table-row]:cursor-pointer [&_.ant-table-expanded-row.ant-table-expanded-row-level-1>td]:bg-[#F2F5FF]!"
            handleRowClick={handleGetIdCorrespondence}
            rowClassName={(record: CorrespondenceResponse) => {
              const isExpanded = expandedRowKeys.includes(record.id as number);
              const isHighlighted =
                !!highlightedId && String(record.id) === String(highlightedId);
              if (isHighlighted) {
                return "row-return-highlight [&>td]:bg-blue-50/70!";
              }
              if (isExpanded) {
                return "[&>td]:bg-[#E9F0FF]! hover:[&>td]:bg-[#E9F0FF]!";
              }
              return "";
            }}
            direction={1}
            autoFilter={true}
            queryParams={{
              ...(extraParams as Record<string, unknown>),
              ...(showTabs ? { status: currentTab } : {}),
            }}
            scroll={{}}
            showSizeChanger={false}
            customPagination={true}
            onRow={(record) => {
              return {
                onClick: () => {
                  handleGetIdCorrespondence(record);

                  if (showExpandRow) {
                    handleNavigateToLetter(record);
                  }
                },
              };
            }}
            expandable={
              !showExpandRow
                ? {
                    expandedRowRender: (record: CorrespondenceResponse) => (
                      <ExpandedRowDetails
                        record={record}
                        onNavigateToLetter={handleNavigateToLetter}
                        onNavigateToExecution={handleNavigateToExecution}
                        onOpenDocument={handleOpenModal}
                      />
                    ),
                    expandRowByClick: true,
                    expandedRowKeys: expandedRowKeys,
                    onExpand: (expanded, record) => {
                      const key = record.id as number;
                      setExpandedRowKeys(
                        expanded
                          ? [...expandedRowKeys, key]
                          : expandedRowKeys.filter((k) => k !== key),
                      );
                    },
                    showExpandColumn: false,
                  }
                : undefined
            }
          />
        </div>
      </div>
      <BookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        toNavigate={() => handleNavigateToExecution(true)}
      />
      <MoveToFolderModal
        isOpen={folderModalRecordId !== null}
        onClose={() => setFolderModalRecordId(null)}
        documentId={folderModalRecordId}
        folders={folders}
        isInternal={type.includes("internal")}
      />
    </>
  );
};
