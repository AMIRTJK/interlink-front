import { ConfigProvider } from "antd";
import { If, Loader } from "@shared/ui";
import type { IAccessUser } from "../model";
import { useUserProfileModalState } from "./userProfileModal/useUserProfileModalState";
import { UserProfileHeader } from "./userProfileModal/UserProfileHeader";
import { UserProfileTabNav } from "./userProfileModal/UserProfileTabNav";
import { UserProfileTabProfile } from "./userProfileModal/UserProfileTabProfile";
import { UserProfileTabPermissions } from "./userProfileModal/UserProfileTabPermissions";
import { UserProfileFooter } from "./userProfileModal/UserProfileFooter";

interface IProps {
  user: IAccessUser;
  onClose: () => void;
  onEdit: (user: IAccessUser) => void;
  onDelete: (id: number) => void;
  allRoles: {
    id: number;
    name: string;
    permissions?: string[] | { name: string }[];
  }[];
}

export const UserProfileModal = ({
  user,
  onClose,
  onEdit,
  onDelete,
  allRoles: rolesList,
}: IProps) => {
  const {
    tab,
    setTab,
    isDataLoading,
    selectedRoles,
    availableRolesToAdd,
    handleAddRole,
    handleRemoveRole,
    relevantPermissions,
    paginatedAccessLevels,
    effectivePermissions,
    accessPage,
    setAccessPage,
    ACCESS_PAGE_SIZE,
    roleGrantedPermissions,
    directPermissionsState,
    deniedPermissionsState,
    handleToggleDirect,
    handleToggleDenied,
    handleResetToStandard,
    groupedPermissions,
    paginatedGroupEntries,
    permissionsPage,
    setPermissionsPage,
    PAGE_SIZE,
    handleSave,
    handleSavePermissions,
    handleUpdateStatus,
    handleDeleteConfirm,
    updateRolesM,
    updateDirectM,
    updateDeniedM,
    currentStatus,
    statusMeta,
    currentFullName,
    currentEmail,
    currentDepartment,
    currentPosition,
    formattedJoinedAt,
  } = useUserProfileModalState({
    user,
    onClose,
    onEdit,
    onDelete,
    allRoles: rolesList,
  });

  return (
    <ConfigProvider theme={{ token: { zIndexPopupBase: 10000 } }}>
      <div
        className="fixed inset-0! z-9998! bg-slate-900/40! backdrop-blur-sm! flex! items-center! justify-center! p-4!"
        onClick={onClose}
      >
        <div
          onClick={(ev) => ev.stopPropagation()}
          className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col min-h-[800px]! max-h-[820px]!"
        >
          <UserProfileHeader
            currentFullName={currentFullName}
            currentPosition={currentPosition}
            currentEmail={currentEmail}
            currentDepartment={currentDepartment}
            formattedJoinedAt={formattedJoinedAt}
            statusMeta={statusMeta}
            onClose={onClose}
          />

          <UserProfileTabNav tab={tab} onTabChange={setTab} />

          <div className="px-6 py-6 overflow-y-auto flex-1 relative">
            <If is={isDataLoading}>
              <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                <Loader />
              </div>
            </If>
            <If is={!isDataLoading}>
              <If is={tab === "profile"}>
                <UserProfileTabProfile
                  selectedRoles={selectedRoles}
                  availableRolesToAdd={availableRolesToAdd}
                  onAddRole={handleAddRole}
                  onRemoveRole={handleRemoveRole}
                  relevantPermissions={relevantPermissions}
                  paginatedAccessLevels={paginatedAccessLevels}
                  effectivePermissions={effectivePermissions}
                  accessPage={accessPage}
                  onAccessPageChange={setAccessPage}
                  ACCESS_PAGE_SIZE={ACCESS_PAGE_SIZE}
                />
              </If>
              <If is={tab === "permissions"}>
                <UserProfileTabPermissions
                  roleGrantedPermissions={roleGrantedPermissions}
                  directPermissionsState={directPermissionsState}
                  deniedPermissionsState={deniedPermissionsState}
                  onToggleDirect={handleToggleDirect}
                  onToggleDenied={handleToggleDenied}
                  onResetToStandard={handleResetToStandard}
                  groupedPermissions={groupedPermissions}
                  paginatedGroupEntries={paginatedGroupEntries}
                  permissionsPage={permissionsPage}
                  onPermissionsPageChange={setPermissionsPage}
                  PAGE_SIZE={PAGE_SIZE}
                />
              </If>
              <If is={tab !== "profile" && tab !== "permissions"}>
                <div className="py-12 text-center text-slate-400 text-sm">
                  Раздел находится в разработке
                </div>
              </If>
            </If>
          </div>

          <UserProfileFooter
            user={user}
            currentStatus={currentStatus}
            tab={tab}
            isDataLoading={isDataLoading}
            onClose={onClose}
            onEdit={onEdit}
            onUpdateStatus={handleUpdateStatus}
            onDeleteConfirm={handleDeleteConfirm}
            onSaveRoles={handleSave}
            onSavePermissions={handleSavePermissions}
            isRolesPending={updateRolesM.isPending}
            isDirectPending={updateDirectM.isPending}
            isDeniedPending={updateDeniedM.isPending}
          />
        </div>
      </div>
    </ConfigProvider>
  );
};
