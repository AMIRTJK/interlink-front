import "./style.css";
import { Button, If, UniversalTable } from "@shared/ui";
import { useMemo, useState } from "react";
import AddIcon from "../../../assets/icons/add-icon.svg";
import { useLocation, useNavigate } from "react-router";
import { useRegistryColumns, getRegistryFilters } from "../lib";
import { useGetQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { StatusTabs } from "@features/StatusTabs";
import { DocView } from "@widgets/DocView";
import wordIcon from "../../../assets/icons/word2.svg";
import executionIcon from "../../../assets/icons/execution.svg";
interface RegistryTableProps<T extends Record<string, unknown>> {
  data?: T[];
  isLoading?: boolean;
  type: string;
  createButtonText?: string;
  extraParams?: Record<string, any>;
}

export const RegistryTable = <T extends Record<string, unknown>>({
  data,
  isLoading,
  createButtonText,
  type,
  extraParams,
}: RegistryTableProps<T>) => {
  const [currentTab, setCurrentTab] = useState(extraParams?.tab || "draft");

  const navigate = useNavigate();
  const location = useLocation();

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

  const tabCounts = useMemo(() => countersData?.data || {}, [countersData]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState<readonly React.Key[]>(
    []
  );
  const [isClosable, setIsClosable] = useState(false);

  const handleShowDoc = () => {
    setIsModalOpen(true);
    setIsClosable(false);

    setTimeout(() => {
      setIsBookOpen(true);
      setTimeout(() => {
        setIsClosable(true);
      }, 400);
    }, 500);
  };

  const handleCloseModal = () => {
    setIsBookOpen(false);
    setTimeout(() => {
      setIsClosable(false);
    }, 800); 

    setTimeout(() => {
      setIsModalOpen(false);
    }, 1500);
  };

  const showTabs = !!extraParams?.kind;

  const expandedRowRender = (record: any) => {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 m-2">
        <div className="flex justify-between items-start gap-6">
          {/* Левая часть — данные */}
          <div className="flex-1">
            <h4 className="font-bold mb-2">Детали записи #{record.id}</h4>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="text-gray-500 mb-0.5 block">Отправитель:</span>
                <p>{record.sender_name}</p>
              </div>

              <div>
                <span className="text-gray-500 mb-0.5 block">Тема:</span>
                <p>{record.subject}</p>
              </div>

              <div>
                <span className="text-gray-500 mb-0.5 block">Дата:</span>
                <p>{record.created_at}</p>
              </div>

              <div>
                <span className="text-gray-500 mb-0.5 block">
                  Входящий номер:
                </span>
                <p>{record.incomingNumber}</p>
              </div>

              <div>
                <span className="text-gray-500 mb-0.5 block">
                  Исходящий номер:
                </span>
                <p>{record.outgoingNumber}</p>
              </div>
              <div>
                <span className="text-gray-500 mb-0.5 block">Статус:</span>
                <p>{record.status}</p>
              </div>
            </div>
          </div>

          {/* Правая часть — кнопки */}
          <div className="flex flex-col gap-2">
            <Button
              type="default"
              text="Исполнение"
              withIcon
              icon={executionIcon}
              iconAlt="execution"
              onClick={handleShowDoc}
              className="bg-[#0037AF]! text-white!"
            />
            <Button
              type="default"
              text="Документ"
              withIcon
              icon={wordIcon}
              iconAlt="word"
              onClick={handleShowDoc}
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
            />
          </If>
        </nav>
        <div
          className={`px-2 ${isAllowed && createButtonText ? "block!" : "hidden!"}`}
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
            url={ApiRoutes.GET_CORRESPONDENCES}
            filters={filters}
            columns={columns}
            className="[&_.ant-table-cell]:rounded-none! [&_.ant-pagination]:px-4! [&_.ant-table-row]:cursor-pointer"
            direction={1}
            autoFilter={true}
            queryParams={{
              ...extraParams,
              ...(showTabs ? { status: currentTab } : {}),
            }}
            scroll={{}}
            showSizeChanger={false}
            customPagination={true}
            expandable={{
              expandedRowRender: expandedRowRender,
              expandRowByClick: true,
              expandedRowKeys: expandedRowKeys,
              onExpand: (expanded, record) => {
                const key = record.id;
                setExpandedRowKeys(
                  expanded
                    ? [...expandedRowKeys, key]
                    : expandedRowKeys.filter((k) => k !== key)
                );
              },
              showExpandColumn: false,
            }}
          />
        </div>
      </div>
      <DocView
        open={isModalOpen}
        bookOpen={isBookOpen}
        onClose={handleCloseModal}
        closable={isClosable}
      />
    </>
  );
};
