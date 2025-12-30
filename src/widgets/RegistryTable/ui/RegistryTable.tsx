import { StatusTabs } from "@features/StatusTabs";
import { Button, UniversalTable } from "@shared/ui";
import { useState } from "react";
import AddIcon from "../../../assets/icons/add-icon.svg";
import { FilterRegistry } from "@features/FilterRegistry";
import { useLocation, useNavigate } from "react-router";
import { getRegistryColumns, getRegistryFilters } from "../lib";
import { tokenControl } from "@shared/lib";
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
  // При необходимости можно рефактор сделать
  const userRoles = tokenControl.getUserRole()?.split(", ") ?? [];
  const canCreate = userRoles.includes("correspondence.create");
  const canView = userRoles.includes("correspondence.register");
  return (
    <div className="bg-white flex flex-col gap-2 w-full h-full">
      <nav>
        <StatusTabs activeTab={currentTab} onTabChange={setCurrentTab} />
      </nav>
      {/* Panel Control */}
      <div className={`px-2 ${canCreate ? "block" : "hidden"}`}>
        <Button
          onClick={handleCreate}
          type="default"
          text={createButtonText}
          withIcon={true}
          disabled={!canCreate}
          icon={AddIcon}
          className="h-9! px-[34px]! text-[#0037AF]! border-[#0037AF]! rounded-lg! transition-all! hover:opacity-75!"
        />
      </div>
      {/* <div className="px-2">
        <FilterRegistry />
      </div> */}
      <div className={`${canView ? "block px-2" : "hidden"}`}>
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
        />
      </div>
    </div>
  );
};
