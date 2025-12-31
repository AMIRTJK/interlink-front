import { StatusTabs } from "@features/StatusTabs";
import { Button, UniversalTable } from "@shared/ui";
import { useState } from "react";
import AddIcon from "../../../assets/icons/add-icon.svg";
// import { FilterRegistry } from "@features/FilterRegistry";
import { useLocation, useNavigate } from "react-router";
import { getRegistryColumns, getRegistryFilters } from "../lib";
import { tokenControl, useGetQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";

interface RegistryTableProps<T extends Record<string, unknown>> {
  data?: T[];
  isLoading?: boolean;
  type: string;
  createButtonText: string;
  extraParams?: Record<string, any>;
}

export const RegistryTable = <T extends Record<string, unknown>>({
  data,
  isLoading,
  createButtonText,
  type,
  extraParams,
}: RegistryTableProps<T>) => {
  console.log(data, isLoading);
  const [currentTab, setCurrentTab] = useState("inbox");

  const navigate = useNavigate();
  const location = useLocation();

  const handleCreate = () => {
    navigate(`${location.pathname}/create`);
  };
  const columns = getRegistryColumns(type);
  const filters = getRegistryFilters(type);

  const { firstQueryData, isPending } = useGetQuery({
    url: ApiRoutes.FETCH_PERMISSIONS,
    method: "GET",
    useToken: true,
    options: {
      enabled: tokenControl.get() !== null,
    },
  });

  const canCreate = firstQueryData?.data?.find(
    (item: { name: string }) => item.name === `correspondence.create`
  );
  const canView = firstQueryData?.data?.find(
    (item: { name: string }) => item.name === `correspondence.view`
  );

  const inboxCount = Number(tokenControl.getOutgoingLetterCount()) || 0;
  return (
    <div className="bg-white flex flex-col gap-2 w-full h-full rounded-2xl overflow-hidden">
      {" "}
      <nav>
        <StatusTabs
          counts={{ inbox: inboxCount }}
          activeTab={currentTab}
          onTabChange={setCurrentTab}
        />
      </nav>
      {/* Panel Control */}
      <div className={`px-2 ${canCreate ? "block!" : "hidden!"}`}>
        <Button
          onClick={handleCreate}
          type="default"
          text={createButtonText}
          withIcon={true}
          loading={isLoading || isPending}
          disabled={isLoading || isPending}
          icon={AddIcon}
          className={`${" h-9! px-8.5!  text-[#0037AF]! border-[#0037AF]! rounded-lg! transition-all! hover:opacity-75!"}`}
        />
      </div>
      {/* <div className="px-2">
        <FilterRegistry />
      </div> */}
      <div className={`${canView ? "block! px-2!" : "hidden!"}`}>
        <UniversalTable
          url={ApiRoutes.GET_CORRESPONDENCES}
          filters={filters}
          columns={columns}
          className="[&_.ant-table-cell]:rounded-none! [&_.ant-pagination]:px-4!"
          direction={1}
          autoFilter={true}
          queryParams={{ ...extraParams }}
          scroll={{}}
          showSizeChanger={false}
          customPagination={true}
        />
      </div>
    </div>
  );
};
