import { MoreOutlined, RollbackOutlined } from "@ant-design/icons";
import { Button, Dropdown, MenuProps } from "antd";
import archiveIcon from "../../../../../assets/icons/archive-icon.svg";
import pinnedIcon from "../../../../../assets/icons/pinned-icon.svg";
import folderIcon from "../../../../../assets/icons/folder-icon.svg";
import trashIcon from "../../../../../assets/icons/trash-icon.svg";

interface IProps {
  record: any;
  type?: string;
  onOpenFolderModal?: (id: number) => void;
  onArchive: (payload: { id: number; is_archived: boolean }) => void;
  onPin: (payload: { id: number; is_pinned: boolean }) => void;
  onRestore: (payload: { id: number }) => void;
  onDelete: (payload: { id: number }) => void;
}

export const IncomingRowActionsCell = ({
  record,
  type,
  onOpenFolderModal,
  onArchive,
  onPin,
  onRestore,
  onDelete,
}: IProps) => {
  const isTrashed = type === "trashed" || type === "internal-trashed";
  const isArchived = type === "archived" || type === "internal-archived";
  const isPinned = type === "pinned" || type === "internal-pinned";

  const items: MenuProps["items"] = [
    isArchived
      ? null
      : {
          key: "archive",
          label: "В архив",
          icon: <img src={archiveIcon} className="w-5 h-5" />,
          onClick: () => {
            onArchive({ id: record.id, is_archived: true });
          },
        },
    isPinned
      ? null
      : {
          key: "pin",
          label: "Закрепить",
          icon: <img src={pinnedIcon} className="w-5 h-5" />,
          onClick: () => {
            onPin({ id: record.id, is_pinned: true });
          },
        },
    {
      key: "folder",
      label: "В папку",
      icon: <img src={folderIcon} className="w-5 h-5" />,
      onClick: () => {
        if (onOpenFolderModal) {
          onOpenFolderModal(record.id);
        }
      },
    },
    {
      type: "divider",
    },
    isTrashed
      ? {
          key: "restore",
          label: "Восстановить",
          icon: <RollbackOutlined className="text-[#0037AF]!" />,
          onClick: () => onRestore({ id: record.id }),
        }
      : {
          key: "delete",
          label: "Удалить",
          danger: true,
          icon: <img src={trashIcon} className="w-5 h-5" />,
          onClick: () => onDelete({ id: record.id }),
        },
  ];

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Dropdown
        menu={{ items }}
        trigger={["click"]}
        placement="bottomRight"
        overlayClassName="custom-registry-dropdown"
      >
        <Button
          type="text"
          icon={<MoreOutlined style={{ fontSize: "20px", color: "#8C8C8C" }} />}
        />
      </Dropdown>
    </div>
  );
};
