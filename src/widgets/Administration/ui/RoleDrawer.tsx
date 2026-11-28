import * as React from "react";
import { T } from "../theme/tokens";
import type { RoleCard } from "../model";
import { useRoleDrawerState } from "./roleDrawer/useRoleDrawerState";
import { RoleDrawerHeader } from "./roleDrawer/RoleDrawerHeader";
import { RoleDrawerPermsList } from "./roleDrawer/RoleDrawerPermsList";
import { RoleDrawerFooter } from "./roleDrawer/RoleDrawerFooter";

export function RoleDrawer({
  role,
  allPermNames,
  userCount,
  memberInitials,
  onClose,
  isFirstOpen,
  onSaved,
  onDeleteRequest,
  addToast,
}: {
  role: RoleCard;
  allPermNames: string[];
  userCount: number;
  memberInitials: string[];
  onClose: () => void;
  isFirstOpen: boolean;
  onSaved: () => void;
  onDeleteRequest: () => void;
  addToast: (msg: string) => void;
}) {
  const {
    perms,
    staggerGen,
    updateRoleM,
    togglePerm,
    toggleChildPerm,
    handleSave,
  } = useRoleDrawerState({
    role,
    allPermNames,
    onSaved,
    addToast,
  });

  const panelStyle: React.CSSProperties = isFirstOpen
    ? { animation: "drawerSlideIn 320ms cubic-bezier(0,0,0.2,1) forwards" }
    : {};

  return (
    <div
      style={{
        width: 340,
        minWidth: 340,
        background: T.surface,
        borderLeft: `1px solid ${T.border}`,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: T.font,
        ...panelStyle,
      }}
    >
      <RoleDrawerHeader role={role} onClose={onClose} />

      <RoleDrawerPermsList
        perms={perms}
        staggerGen={staggerGen}
        togglePerm={togglePerm}
        toggleChildPerm={toggleChildPerm}
        roleName={role.name}
        userCount={userCount}
        memberInitials={memberInitials}
      />

      <RoleDrawerFooter
        onSave={handleSave}
        isPending={updateRoleM.isPending}
        onDeleteRequest={onDeleteRequest}
      />
    </div>
  );
}
