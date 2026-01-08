import { Button, If, UniversalTable } from "@shared/ui";
import { useMemo, useState } from "react";
import AddIcon from "../../../assets/icons/add-icon.svg";
import { useLocation, useNavigate } from "react-router";
import { useRegistryColumns, getRegistryFilters } from "../lib";
import { useGetQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { StatusTabs } from "@features/StatusTabs";
import { Modal } from "antd";
import { DocView } from "@widgets/DocView";
// import { FilterRegistry } from "@features/FilterRegistry";

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

  const handleShowDoc = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const showTabs = !!extraParams?.kind;

  const expandedRowRender = (record: any) => {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 m-2">
        <h4 className="font-bold mb-2">Детали записи #{record.id}</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-gray-500">Отправитель:</span>{" "}
            {record.sender_name}
          </div>
          <div>
            <span className="text-gray-500">Тема:</span> {record.subject}
          </div>
          <div>
            <Button type="default" text="Визировать" onClick={handleShowDoc} />
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
        {/* Panel Control */}
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
        {/* <div className="px-2">
        <FilterRegistry />
      </div> */}
        <div className={`${isAllowed ? "block! px-2!" : "hidden!"}`}>
          <UniversalTable
            url={ApiRoutes.GET_CORRESPONDENCES}
            filters={filters}
            columns={columns}
            className="[&_.ant-table-cell]:rounded-none! [&_.ant-pagination]:px-4!"
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
            }}
          />
        </div>
      </div>
      <Modal
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        className="modal-task"
        title={null}
        width={1000}
        centered
        maskClosable={true}
        closable={true}
      >
        <DocView docName="Документ" />
      </Modal>
    </>
  );
};
