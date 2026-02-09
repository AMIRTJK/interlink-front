import React from "react";
import { App } from "antd";
import "./style.css";
import { FolderModal } from "./FolderModal";
import { useModuleSidebar } from "./useModuleSidebar";
import { ModuleSidebarHorizontal } from "./ModuleSidebarHorizontal";
import { ModuleSidebarVertical } from "./ModuleSidebarVertical";

export const ModuleSidebar = ({
  variant = "horizontal",
  onVariantChange,
}: {
  variant?: "horizontal" | "vertical";
  onVariantChange?: (variant: "horizontal" | "vertical") => void;
}) => {
  const {
    collapsed,
    setCollapsed,
    isModalOpen,
    setIsModalOpen,
    parentId,
    editingFolderId,
    form,
    finalMenuItems,
    activeKey,
    handleAddClick,
    onFinish,
    navigate,
  } = useModuleSidebar(variant);

  return (
    <App>
      {variant === "horizontal" ? (
        <ModuleSidebarHorizontal
          variant={variant}
          onVariantChange={onVariantChange}
          finalMenuItems={finalMenuItems}
          activeKey={activeKey}
          handleAddClick={handleAddClick}
        />
      ) : (
        <ModuleSidebarVertical
          variant={variant}
          onVariantChange={onVariantChange}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          finalMenuItems={finalMenuItems}
          activeKey={activeKey}
          handleAddClick={handleAddClick}
          navigate={navigate}
        />
      )}

      <FolderModal
        isOpen={isModalOpen}
        isEditing={!!editingFolderId}
        parentId={parentId}
        form={form}
        onCancel={() => setIsModalOpen(false)}
        onFinish={onFinish}
      />
    </App>
  );
};
