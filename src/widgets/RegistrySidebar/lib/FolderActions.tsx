import React from "react";
import { Button, Dropdown, MenuProps } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import { CSS_CLASSES } from "./constants";

interface FolderActionsProps {
  menuActions: MenuProps["items"];
  collapsed: boolean;
}

export const FolderActions: React.FC<FolderActionsProps> = ({ menuActions, collapsed }) => {
  if (collapsed || !menuActions || menuActions.length === 0) {
    return null;
  }

  return (
    <Dropdown
      menu={{ items: menuActions }}
      trigger={["click"]}
      placement="bottomRight"
      overlayClassName={CSS_CLASSES.DROPDOWN_OVERLAY}
    >
      <Button
        type="text"
        size="small"
        icon={<MoreOutlined />}
        onClick={(e) => e.stopPropagation()}
      />
    </Dropdown>
  );
};
