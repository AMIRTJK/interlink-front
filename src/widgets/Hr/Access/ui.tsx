import {
  CreateOrganization,
  CreateDepartment,
  CreatePermissionAndRole,
  SetUserRole,
} from "@features/Hr";

// Виджет «Доступ»: организации, отделы, роли и права
export const AccessWidget: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-4 items-start">
      <CreateOrganization />
      <CreateDepartment />
      <CreatePermissionAndRole />
      <SetUserRole />
    </div>
  );
};
