import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button, Flex, TableColumnsType, Tag, Typography } from "antd";
import { getCorrespondenseOutgoingStatusLabel } from "./getCorrespondenseOutgoingStatusLabel";

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
      title: "Действие",
      width: 100,
      render: (organizationData) => (
        <Flex justify="end">
          <Button
            type="text"
            // onClick={(event) => {
            //   event.stopPropagation();
            //   handleEdit(organizationData);
            // }}
            icon={<EditOutlined />}
          />
          <Button
            type="text"
            // onClick={(event) => {
            //   event.stopPropagation();
            //   handleDelete(organizationData);
            // }}
            icon={<DeleteOutlined />}
          />
        </Flex>
      ),
    },
  ];
};
