import "./style.css";
import { TableColumnsType } from "antd";
import { useIncomingRowMutations } from "./incomingColumns/useIncomingRowMutations";
import { AcknowledgedUsersCell } from "./incomingColumns/AcknowledgedUsersCell";
import { IncomingStatusCell } from "./incomingColumns/IncomingStatusCell";
import { IncomingRowActionsCell } from "./incomingColumns/IncomingRowActionsCell";

export const useCorrespondenseIncomingColumns = (
  type?: string,
  onOpenFolderModal?: (id: number) => void,
): TableColumnsType => {
  const isInternal = type?.includes("internal");

  const {
    archiveCorrespondence,
    restoreCorrespondence,
    pinCorrespondence,
    deleteCorrespondence,
  } = useIncomingRowMutations(isInternal);

  return [
    {
      title: isInternal ? "Рег. номер" : "Вх. номер",
      dataIndex: "reg_number",
      render: (val: string, record: any) => {
        const num = val || record?.reg_number;
        if (!num) return "—";
        const prefix = record?.my_prefix || "IN";
        return num.replace(/^[A-Z]+/i, prefix);
      },
    },
    {
      title: "Исх. номер",
      dataIndex: "2",
    },
    {
      title: "Отправитель",
      dataIndex: "sender_name",
    },
    {
      title: "Дата",
      dataIndex: "created_at",
    },
    {
      title: "Тема",
      dataIndex: "subject",
    },
    {
      title: isInternal ? "Получатель" : "Исполнитель",
      // Условный dataIndex: для внутренней берем из вложенного массива, для внешней - обычное поле
      dataIndex: isInternal
        ? ["recipients", 0, "user", 0, "full_name"]
        : "recipient_name",
      render: (value, record: any) => {
        if (isInternal) {
          // Безопасное получение данных для внутренней
          const internalRecipient = record.recipients?.[0]?.user?.full_name;
          return internalRecipient;
        }
        // Для внешней
        return value || record.recipient_name;
      },
    },
    {
      title: "Ознакомились",
      dataIndex: "acknowledged_users",
      render: (users: any[]) => <AcknowledgedUsersCell users={users} />,
    },
    {
      title: "Статус",
      dataIndex: "status",
      render: (_, record: any) => <IncomingStatusCell record={record} />,
    },

    {
      title: "",
      width: 40,
      fixed: "right",
      render: (record) => (
        <IncomingRowActionsCell
          record={record}
          type={type}
          onOpenFolderModal={onOpenFolderModal}
          onArchive={archiveCorrespondence}
          onPin={pinCorrespondence}
          onRestore={restoreCorrespondence}
          onDelete={deleteCorrespondence}
        />
      ),
    },
  ];
};
