import * as React from "react";
import { ToastContainer } from "./components";
import { RoleDrawer } from "./RoleDrawer";
import { CreateRoleModal } from "./CreateRoleModal";
import { CreateUiPermissionModal } from "./CreateUiPermissionModal";
import { DeleteRoleModal } from "./DeleteRoleModal";
import { UserDrawer } from "./UserDrawer";

import { useRolesViewState } from "./rolesView/useRolesViewState";
import { RolesTopBar } from "./rolesView/RolesTopBar";
import { RolesBlockCards } from "./rolesView/RolesBlockCards";
import { RolesRegistryTable } from "./rolesView/RolesRegistryTable";
import { RoleUsersTable } from "./rolesView/RoleUsersTable";

export function RolesView() {
  const {
    toasts,
    addToast,
    removeToast,
    selectedRoleId,
    setSelectedRoleId,
    drawerOpen,
    setDrawerOpen,
    isFirstOpen,
    pulsingCardId,
    viewMode,
    viewTransitioning,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    showCreateRole,
    setShowCreateRole,
    showCreateUiPerm,
    setShowCreateUiPerm,
    showDeleteRole,
    setShowDeleteRole,
    profileUser,
    setProfileUser,
    allPermNames,
    roleCards,
    selectedCard,
    selectedRoleName,
    isRoleFiltered,
    displayedUsers,
    totalUsers,
    memberInitials,
    switchView,
    handleCardClick,
    handleRowClick,
    rowSelection,
    showRoleDrawer,
  } = useRolesViewState();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "stretch",
        gap: 0,
        flex: 1,
        height: "calc(100vh - 135px)",
        maxHeight: "calc(100vh - 135px)",
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          flex: 1,
          minWidth: 0,
          padding: "20px 24px 20px",
          height: "100%",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <RolesTopBar
          viewMode={viewMode}
          onSwitchView={switchView}
          onCreateUiPerm={() => setShowCreateUiPerm(true)}
          onCreateRole={() => setShowCreateRole(true)}
        />

        <div
          style={{
            opacity: viewTransitioning ? 0 : 1,
            transition: "opacity 0.15s ease",
            marginBottom: 24,
          }}
        >
          {viewMode === "block" && (
            <RolesBlockCards
              roleCards={roleCards}
              selectedRoleId={selectedRoleId}
              drawerOpen={drawerOpen}
              pulsingCardId={pulsingCardId}
              onCardClick={handleCardClick}
              onDeleteRole={(cardId) => {
                setSelectedRoleId(cardId);
                setShowDeleteRole(true);
              }}
            />
          )}

          {viewMode === "registry" && (
            <RolesRegistryTable
              roleCards={roleCards}
              selectedRoleId={selectedRoleId}
              drawerOpen={drawerOpen}
              onCardClick={handleCardClick}
              onDeleteRole={(cardId) => {
                setSelectedRoleId(cardId);
                setShowDeleteRole(true);
              }}
            />
          )}
        </div>

        <RoleUsersTable
          isRoleFiltered={isRoleFiltered}
          selectedRoleName={selectedRoleName}
          totalUsers={totalUsers}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          displayedUsers={displayedUsers}
          rowSelection={rowSelection}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onRowClick={handleRowClick}
        />
      </div>

      {profileUser ? (
        <div
          style={{
            height: "100%",
            maxHeight: "100%",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <UserDrawer
            key={profileUser.id}
            user={profileUser}
            allPermNames={allPermNames}
            onClose={() => setProfileUser(null)}
            isFirstOpen={isFirstOpen}
            addToast={addToast}
          />
        </div>
      ) : (
        showRoleDrawer &&
        selectedCard && (
          <div
            style={{
              height: "100%",
              maxHeight: "100%",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <RoleDrawer
              key={selectedCard.id}
              role={selectedCard}
              allPermNames={allPermNames}
              userCount={selectedCard.userCount}
              memberInitials={memberInitials}
              onClose={() => {
                setDrawerOpen(false);
                setSelectedRoleId(null);
              }}
              isFirstOpen={isFirstOpen}
              onSaved={() => {}}
              onDeleteRequest={() => setShowDeleteRole(true)}
              addToast={addToast}
            />
          </div>
        )
      )}

      {showCreateRole && (
        <CreateRoleModal
          allPermNames={allPermNames}
          roleCards={roleCards}
          onClose={() => setShowCreateRole(false)}
          onCreated={() => {}}
          addToast={addToast}
        />
      )}
      {showCreateUiPerm && (
        <CreateUiPermissionModal
          onClose={() => setShowCreateUiPerm(false)}
          onCreated={() => {}}
          addToast={addToast}
        />
      )}
      {showDeleteRole && selectedCard && (
        <DeleteRoleModal
          roleId={selectedCard.id}
          roleName={selectedCard.name}
          userCount={selectedCard.userCount}
          onClose={() => setShowDeleteRole(false)}
          onDeleted={() => {
            setDrawerOpen(false);
            setSelectedRoleId(null);
          }}
          addToast={addToast}
        />
      )}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
