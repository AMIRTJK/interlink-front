import "./style.css";
import { Button, If, UniversalTable } from "@shared/ui";
import { useEffect, useMemo, useState } from "react";
import AddIcon from "../../../assets/icons/add-icon.svg";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useRegistryColumns, getRegistryFilters } from "../lib";
import { useGetQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { StatusTabs } from "@features/StatusTabs";
// import { DocView } from "@widgets/DocView";
import wordIcon from "../../../assets/icons/word2.svg";
import executionIcon from "../../../assets/icons/execution.svg";
import { BookModal } from "@widgets/BookModal";
import { AppRoutes } from "@shared/config";
import {
  CorrespondenceResponse,
  CorrespondenseStatus,
  InternalCorrespondenceStatus,
} from "@entities/correspondence";
import { INTERNAL_OUTGOING_TABS } from "../lib/lib";
interface RegistryTableProps<T extends Record<string, unknown>> {
  data?: T[];
  isLoading?: boolean;
  type: string;
  createButtonText?: string;
  extraParams?: Record<string, unknown>;
  url?: string; // URL для загрузки данных (по умолчанию GET_CORRESPONDENCES)
}

export const RegistryTable = <T extends Record<string, unknown>>({
  isLoading,
  createButtonText,
  type,
  extraParams,
  url = ApiRoutes.GET_CORRESPONDENCES, // Если URL не передан, используем стандартный
}: RegistryTableProps<T>) => {
  const tabFromParams = extraParams?.tab;

  const defaultTab =
    type === "internal-outgoing"
      ? InternalCorrespondenceStatus.TO_APPROVE
      : "draft";

  const initialTab =
    typeof tabFromParams === "string" ? tabFromParams : defaultTab;

  const [currentTab, setCurrentTab] = useState(initialTab);
  const [correspondenceId, setCorrespondenceId] = useState<string | number>();

  const navigate = useNavigate();
  const location = useLocation();

  const [searchParams] = useSearchParams();
  const folderId = searchParams.get("folderId");

  const isDefaultFolder = !!searchParams.get("defaultFolder");

  const customTabs = useMemo(() => {
    if (type === "internal-incoming") {
      return []; // Пустой массив скроет табы
    }
    if (type === "internal-outgoing") {
      return [];
    }
    if (type === "internal-drafts") {
      return INTERNAL_OUTGOING_TABS;
    }
    return undefined; // undefined заставит StatusTabs использовать дефолтные
  }, [type]);

  const currentUrl = url;

  const showCreateButton =
    (type.includes("incoming") || type.includes("outgoing")) &&
    !folderId &&
    !isDefaultFolder &&
    !type.includes("drafts") &&
    !type.includes("archive");

  const handleCreate = () => {
    navigate(`${location.pathname}/create`);
  };
  const columns = useRegistryColumns(type);
  const filters = getRegistryFilters(type);

  const { data: isAllowed, isPending } = useGetQuery({
    preload: true,
    preloadConditional: ["correspondence.create", "correspondence.view"],
  });

  const { data: countersData } = useGetQuery({
    url: ApiRoutes.GET_COUNTERS_CORRESPONDENCE,
    params: extraParams?.kind ? { kind: extraParams.kind } : {},
  });

  const tabCounts = useMemo(
    () => (countersData as Record<string, any>)?.data || {},
    [countersData],
  );

  const [expandedRowKeys, setExpandedRowKeys] = useState<readonly React.Key[]>(
    [],
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleGetIdCorrespondence = (record: CorrespondenceResponse) => {
    setCorrespondenceId(record.id);
  };

  useEffect(() => {
    if (location.state && (location.state as any).openBookModal) {
      setIsModalOpen(true);
      if ((location.state as any).savedCorrespondenceId) {
        setCorrespondenceId((location.state as any).savedCorrespondenceId);
      }

      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleNavigateToExecution = (fromModal = false) => {
    navigate(
      AppRoutes.CORRESPONDENCE_INCOMING_SHOW.replace(
        ":id",
        String(correspondenceId),
      ),
      {
        state: {
          openExecution: true,
          returnToBookModal: fromModal,
          previousPath: location.pathname + location.search,
          savedCorrespondenceId: correspondenceId,
        },
      },
    );
  };

  const handleNavigateToLetter = (record: CorrespondenceResponse) => {
    console.log(type);

    const route = type.includes("external-incoming")
      ? AppRoutes.CORRESPONDENCE_INCOMING_SHOW
      : type.includes("internal-incoming")
        ? AppRoutes.INTERNAL_INCOMING_SHOW
        : type.includes("internal-outgoing") || type.includes("internal-drafts")
          ? AppRoutes.INTERNAL_OUTGOING_SHOW
          : "";

    navigate(route.replace(":id", String(record.id)));
  };

  const showTabs = Array.isArray(customTabs)
    ? customTabs.length > 0
    : !!extraParams?.kind;

  const expandedRowRender = (record: CorrespondenceResponse) => {
    const isExecuteButtonActive =
      CorrespondenseStatus.TO_EXECUTE === record.status;

    return (
      <div className="p-4 bg-[#F2F5FF]">
        <div className="flex justify-between items-start gap-6">
          <div className="flex-1">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="text-[#6D8AC9] mb-0.5 block">
                  Отправитель:
                </span>
                <p>{record.sender_name as string}</p>
              </div>

              <div>
                <span className="text-[#6D8AC9] mb-0.5 block">Тема:</span>
                <p>{record.subject as string}</p>
              </div>

              <div>
                <span className="text-[#6D8AC9] mb-0.5 block">Дата:</span>
                <p>{record.created_at as string}</p>
              </div>

              <div>
                <span className="text-[#6D8AC9] mb-0.5 block">
                  Входящий номер:
                </span>
                <p>{null}</p>
              </div>

              <div>
                <span className="text-[#6D8AC9] mb-0.5 block">
                  Исходящий номер:
                </span>
                <p>{null}</p>
              </div>
              <div>
                <span className="text-[#6D8AC9] mb-0.5 block">Статус:</span>
                <p>{record.status as string}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              type="default"
              text="Перейти к записи"
              withIcon
              iconAlt="execution"
              className="bg-[#0037AF]! text-white!"
              onClick={() => handleNavigateToLetter(record)}
            />
            <Button
              // disabled={!isExecuteButtonActive}
              type="default"
              text="Перейти к исполнению"
              withIcon
              icon={executionIcon}
              iconAlt="execution"
              className={`bg-[#0037AF]! text-white! ${!isExecuteButtonActive ? "opacity-50" : ""}`}
              onClick={() => handleNavigateToExecution(false)}
            />
            <Button
              className="border-[#0037AF]! text-[#0037AF]! font-medium!"
              type="default"
              text="Документ"
              withIcon
              icon={wordIcon}
              iconAlt="word"
              onClick={handleOpenModal}
            />
          </div>
        </div>
      </div>
    );
  };

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
            rowClassName={(record: CorrespondenceResponse) =>
              expandedRowKeys.includes(record.id as number)
                ? "[&>td]:bg-[#E9F0FF]! hover:[&>td]:bg-[#E9F0FF]!"
                : ""
            }
            direction={1}
            autoFilter={true}
            queryParams={{
              ...(extraParams as Record<string, unknown>),
              ...(showTabs ? { status: currentTab } : {}),
            }}
            scroll={{}}
            showSizeChanger={false}
            customPagination={true}
            onRow={(record) => ({
              draggable: true,
              onDragStart: (e) => {
                e.dataTransfer.setData("correspondenceId", String(record.id));
                e.dataTransfer.effectAllowed = "move";
                (e.currentTarget as HTMLElement).classList.add("dragging");
              },
              onDragEnd: (e) => {
                (e.currentTarget as HTMLElement).classList.remove("dragging");
              },
            })}
            expandable={{
              expandedRowRender: expandedRowRender,
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
            }}
          />
        </div>
      </div>
      <BookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        toNavigate={() => handleNavigateToExecution(true)}
      />
    </>
  );
};
