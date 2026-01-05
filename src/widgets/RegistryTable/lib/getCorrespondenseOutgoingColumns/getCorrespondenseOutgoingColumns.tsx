import {
  // EditOutlined,
  // DeleteOutlined,
  // FolderOpenOutlined,
  // PushpinOutlined,
  // InboxOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import {
  // Flex,
  Button,
  Dropdown,
  MenuProps,
  TableColumnsType,
  Tag,
  Typography,
} from "antd";
import { getCorrespondenseOutgoingStatusLabel } from "./getCorrespondenseOutgoingStatusLabel";

import archiveIcon from "../../../../assets/icons/archive-icon.svg";
import pinnedIcon from "../../../../assets/icons/pinned-icon.svg";
import folderIcon from "../../../../assets/icons/folder-icon.svg";
import trashIcon from "../../../../assets/icons/trash-icon.svg";

export const getCorrespondenseOutgoingColumns = (): TableColumnsType => {
  return [
    {
      title: "Вх. номер",
      dataIndex: "1",
    },

    {
      title: "Исх. номер",
      dataIndex: "2",
    },
    {
      title: "Отправитель",
      dataIndex: "3",
    },
    {
      title: "Дата",
      dataIndex: "4",
    },
    {
      title: "Тема",
      dataIndex: "5",
    },
    {
      title: "Исполнитель",
      dataIndex: "6",
    },
    {
      title: "Статус",
      dataIndex: "status",
      render: (_, { status }) => {
        const { label, color } = getCorrespondenseOutgoingStatusLabel(status);
        return (
          <Tag
            color={color}
            className="py-0! px-3! overflow-hidden! w-full! block!"
          >
            <Typography.Text
              className="font-medium! text-[#252525]! text-center! truncate! block!"
              ellipsis
            >
              {label}
            </Typography.Text>
          </Tag>
        );
      },
    },
    {
      title: "",
      width: 40,
      fixed: "right",
      render: (record) => {
        const items: MenuProps["items"] = [
          {
            key: "archive",
            label: "В архив",
            icon: <img src={archiveIcon} className="w-5 h-5" />,
            onClick: () => console.log("Archive", record),
          },
          {
            key: "pin",
            label: "Закрепить",
            icon: <img src={pinnedIcon} className="w-5 h-5" />,
            onClick: () => console.log("Pin", record),
          },
          {
            key: "folder",
            label: "В папку",
            icon: <img src={folderIcon} className="w-5 h-5" />,
            onClick: () => console.log("To folder", record),
          },
          {
            type: "divider",
          },
          {
            key: "delete",
            label: "Удалить",
            danger: true,
            icon: <img src={trashIcon} className="w-5 h-5" />,
            onClick: () => console.log("Delete", record),
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
                icon={
                  <MoreOutlined
                    style={{ fontSize: "20px", color: "#8C8C8C" }}
                  />
                }
              />
            </Dropdown>
          </div>
        );
      },
    },
  ];
};
