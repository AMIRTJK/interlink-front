import {
  CreateOrganization,
  CreateDepartment,
  CreatePermissionAndRole,
  SetUserRole,
} from "@features/Hr";

export const RolesTab = () => {
  return (
    <div className="flex flex-wrap gap-4 items-start">
      <CreateOrganization />
      <CreateDepartment />
      <CreatePermissionAndRole />
      <SetUserRole />
    </div>
  );
};
