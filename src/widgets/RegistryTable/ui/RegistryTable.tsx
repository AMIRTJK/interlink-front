import { StatusTabs } from "@features/StatusTabs";
import { Button, UniversalTable } from "@shared/ui";
import { useState } from "react";
import AddIcon from "../../../assets/icons/add-icon.svg";
import { FilterRegistry } from "@features/FilterRegistry";
import { useLocation, useNavigate } from "react-router";
import { getRegistryColumns, getRegistryFilters } from "../lib";
<<<<<<< Updated upstream
import { tokenControl } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
=======
import { tokenControl, useGetQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";

>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
  // При необходимости можно рефактор сделать
  const userRoles = tokenControl.getUserRole()?.split(", ") ?? [];
  const canCreate = userRoles.includes("correspondence.create");
  const canView = userRoles.includes("correspondence.register");
=======
  const {firstQueryData,isPending}=useGetQuery({
    url: `${ApiRoutes.FETCH_PERMISSIONS}`,
    method:"GET",
    useToken:true,
    options:{
      enabled:tokenControl.get()!==null,
    },
  })

const canCreate=firstQueryData?.data.some((item:{name:string})=>item.name==='correspondence.create');
const canViewRegistry=firstQueryData?.data.some((item:{name:string})=>item.name==='correspondence.view');
>>>>>>> Stashed changes
  return (
    <div className="bg-white flex flex-col gap-2 w-full h-full">
      <nav>
        <StatusTabs activeTab={currentTab} onTabChange={setCurrentTab} />
      </nav>
      {/* Panel Control */}
<<<<<<< Updated upstream
      <div className={`px-2 ${canCreate ? "block" : "hidden"}`}>
=======
      <div className={`${canCreate ? "block! px-2!" : "hidden!"}`}>
>>>>>>> Stashed changes
        <Button
          onClick={handleCreate}
          type="default"
          text={createButtonText}
          withIcon={true}
          loading={isPending}
          disabled={isPending}
          icon={AddIcon}
          className={`${' h-9! px-[34px]! text-[#0037AF]! border-[#0037AF]! rounded-lg! transition-all! hover:opacity-75!'}`}
        />
      </div>
      {/* <div className="px-2">
        <FilterRegistry />
<<<<<<< Updated upstream
      </div> */}
      <div className={`${canView ? "block px-2" : "hidden"}`}>
=======
      </div>
      <div className={`${canViewRegistry ? "block! px-2!" : "hidden!"}`}>
>>>>>>> Stashed changes
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
