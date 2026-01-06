import { Button, If, UniversalTable } from "@shared/ui";
import { useMemo, useState } from "react";
import AddIcon from "../../../assets/icons/add-icon.svg";
import { useLocation, useNavigate } from "react-router";
import { useRegistryColumns, getRegistryFilters } from "../lib";
import { useGetQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { StatusTabs } from "@features/StatusTabs";
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

  const showTabs = !!extraParams?.kind;

  return (
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
        />
      </div>
    </div>
  );
};
