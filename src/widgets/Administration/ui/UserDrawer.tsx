import * as React from "react";
import { T } from "../theme/tokens";
import type { ExtUser } from "../model";
import { useUserDrawerState } from "./userDrawer/useUserDrawerState";
import { UserDrawerHeader } from "./userDrawer/UserDrawerHeader";
import { UserDrawerPermsList } from "./userDrawer/UserDrawerPermsList";
import { UserDrawerFooter } from "./userDrawer/UserDrawerFooter";

export function UserDrawer({
  user,
  allPermNames,
  onClose,
  isFirstOpen,
  addToast,
}: {
  user: ExtUser;
  allPermNames: string[];
  onClose: () => void;
  isFirstOpen: boolean;
  addToast: (msg: string) => void;
}) {
  const {
    perms,
    staggerGen,
    resolvedRoles,
    isLoading,
    updateDirectM,
    updateDeniedM,
    togglePerm,
    handleSave,
  } = useUserDrawerState({
    user,
    allPermNames,
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
      <UserDrawerHeader
        user={user}
        resolvedRoles={resolvedRoles}
        onClose={onClose}
      />

      <UserDrawerPermsList
        isLoading={isLoading}
        perms={perms}
        staggerGen={staggerGen}
        togglePerm={togglePerm}
      />

      <UserDrawerFooter
        onSave={handleSave}
        isDisabled={
          isLoading || updateDirectM.isPending || updateDeniedM.isPending
        }
      />
    </div>
  );
}
