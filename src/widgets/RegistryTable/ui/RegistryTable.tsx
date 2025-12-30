import { StatusTabs } from "@features/StatusTabs";
import { Button, UniversalTable } from "@shared/ui";
import { useEffect, useState } from "react";
import AddIcon from "../../../assets/icons/add-icon.svg";
import { FilterRegistry } from "@features/FilterRegistry";
import { useLocation, useNavigate } from "react-router";
import { getRegistryColumns, getRegistryFilters } from "../lib";
import { tokenControl, useGetQuery } from "@shared/lib";

interface RegistryTableProps<T extends Record<string, unknown>> {
  data?: T[];
  isLoading?: boolean;
  type: string;
  createButtonText: string;
}

export const RegistryTable = <T extends Record<string, unknown>>({
  data,
  isLoading,
  createButtonText,
  type,
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
    const {data:userRoles}=useGetQuery({
    method:"GET",
    url:"/api/v1/admin/permissions",
    options:{
      enabled:tokenControl.get()!==null
    }
  })

  // Берем userRole.
const userRole: { group: string; name: string; permissions: string[] } | null =
  (userRoles as { data: { group: string; name: string; permissions: string[] }[] } | undefined)?.data
    .find(item => item.name === "correspondence.create") || null;
    useEffect(()=>{
      tokenControl.setUserRole(userRole?.name || "");
    },[userRole])

  return (
    <div className="bg-white flex flex-col gap-2 w-full h-full">
      <nav>
        <StatusTabs activeTab={currentTab} onTabChange={setCurrentTab} />
      </nav>
      {/* Panel Control */}
      <div className={` ${userRole ? 'block px-2' : 'hidden'}`}>
        <Button
          onClick={handleCreate}
          type="default"
          text={createButtonText}
          withIcon={true}
          icon={AddIcon}
          className="h-9! px-[34px]! text-[#0037AF]! border-[#0037AF]! rounded-lg! transition-all! hover:opacity-75!"
        />
      </div>
      <div className="px-2">
        <FilterRegistry />
      </div>
      <div className="px-2">
        <UniversalTable
          dataSource={data}
          filters={filters}
          columns={columns}
          style="flex justify-between"
          className="[&_.ant-table-cell]:rounded-none! [&_.ant-pagination]:px-4!"
          direction={1}
          autoFilter={false}
        />
      </div>
    </div>
  );
};
