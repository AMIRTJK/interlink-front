import { Loader } from "@shared/ui/Loader";
import { T } from "../theme/tokens";
import type { ExtUser, RoleCard } from "../model";
import { mockSessions, mockHistory, mockProfileStats } from "../lib/mock";

import { useUserProfileModalState } from "./userProfileModal/useUserProfileModalState";
import { UserProfileHeader } from "./userProfileModal/UserProfileHeader";
import { UserProfileTabProfile } from "./userProfileModal/UserProfileTabProfile";
import { UserProfileTabAccess } from "./userProfileModal/UserProfileTabAccess";
import { UserProfileTabSessions } from "./userProfileModal/UserProfileTabSessions";
import { UserProfileTabHistory } from "./userProfileModal/UserProfileTabHistory";
import { UserProfileFooter } from "./userProfileModal/UserProfileFooter";

export function UserProfileModal({
  user,
  onClose,
  allRoleNames,
  roleCards,
  addToast,
  onRolesSaved,
}: {
  user: ExtUser;
  onClose: () => void;
  allRoleNames: string[];
  roleCards: RoleCard[];
  addToast: (msg: string) => void;
  onRolesSaved?: () => void;
}) {
  const {
    activeTab,
    setActiveTab,
    localRoles,
    setLocalRoles,
    selectedPermRole,
    setSelectedPermRole,
    permStaggerGen,
    setPermStaggerGen,
    resetConfirmRole,
    setResetConfirmRole,
    actionDropdownOpen,
    setActionDropdownOpen,
    localStatus,
    permsInitialized,
    isUserPermsLoading,
    actionDropdownRef,
    statusCfg,
    roleCfg,
    currentOverridePerms,
    isDirty,
    isSubpermCustomized,
    handleToggleOverride,
    handleOverrideReset,
    handleSaveOverrides,
    handleSaveRoles,
    handleStatusSelect,
    accessItems,
    setUserRolesM,
    updateDirectM,
    updateDeniedM,
  } = useUserProfileModalState({
    user,
    roleCards,
    addToast,
    onRolesSaved,
  });

  const stats = mockProfileStats();
  const sessions = mockSessions();
  const historyItems = mockHistory();

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(15,23,42,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "backdropIn 0.18s ease-out",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.surface,
          borderRadius: 10,
          boxShadow: T.shadowXl,
          animation: "modalFadeIn 0.2s ease-out forwards",
          width: "90vw",
          height: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          fontFamily: T.font,
        }}
      >
        <UserProfileHeader
          user={user}
          onClose={onClose}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          statusCfg={statusCfg}
          roleCfg={roleCfg}
        />

        <div style={{ flex: 1, overflowY: "auto", background: T.bg }}>
          {isUserPermsLoading ? (
            <Loader minHeight="100%" />
          ) : (
            <>
              {activeTab === "profile" && (
                <UserProfileTabProfile
                  stats={stats}
                  localRoles={localRoles}
                  setLocalRoles={setLocalRoles}
                  selectedPermRole={selectedPermRole}
                  setSelectedPermRole={setSelectedPermRole}
                  setPermStaggerGen={setPermStaggerGen}
                  setActiveTab={setActiveTab}
                  allRoleNames={allRoleNames}
                  accessItems={accessItems}
                />
              )}

              {activeTab === "access" && (
                <UserProfileTabAccess
                  localRoles={localRoles}
                  selectedPermRole={selectedPermRole}
                  setSelectedPermRole={setSelectedPermRole}
                  setPermStaggerGen={setPermStaggerGen}
                  resetConfirmRole={resetConfirmRole}
                  setResetConfirmRole={setResetConfirmRole}
                  isDirty={isDirty}
                  handleOverrideReset={handleOverrideReset}
                  currentOverridePerms={currentOverridePerms}
                  permStaggerGen={permStaggerGen}
                  isSubpermCustomized={isSubpermCustomized}
                  handleToggleOverride={handleToggleOverride}
                />
              )}

              {activeTab === "sessions" && (
                <UserProfileTabSessions
                  lastActivity={user.lastActivity}
                  sessions={sessions}
                />
              )}

              {activeTab === "history" && (
                <UserProfileTabHistory historyItems={historyItems} />
              )}
            </>
          )}
        </div>

        <UserProfileFooter
          activeTab={activeTab}
          handleSaveRoles={handleSaveRoles}
          setUserRolesPending={setUserRolesM.isPending}
          handleSaveOverrides={handleSaveOverrides}
          permsInitialized={permsInitialized}
          isUserPermsLoading={isUserPermsLoading}
          updateDirectPending={updateDirectM.isPending}
          updateDeniedPending={updateDeniedM.isPending}
          actionDropdownRef={actionDropdownRef}
          actionDropdownOpen={actionDropdownOpen}
          setActionDropdownOpen={setActionDropdownOpen}
          effectiveStatus={localStatus}
          handleStatusSelect={handleStatusSelect}
        />
      </div>
    </div>
  );
}
