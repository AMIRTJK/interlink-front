import { Tag, Typography } from "antd";
import { getCorrespondenseIncomingStatusLabel } from "../getCorrespondenseIncomingStatusLabel";

export const IncomingStatusCell = ({ record }: { record: any }) => {
  const assignments = Array.isArray(record?.assignments)
    ? record.assignments
    : Array.isArray(record?.assignment_list)
    ? record.assignment_list
    : record?.assignment
    ? [record.assignment]
    : [];

  let label = "Без поручения";
  let color = "#1890ff";

  if (assignments.length > 0) {
    const activeAssign = assignments[assignments.length - 1];
    const assignStatus = (activeAssign?.status || "").toString().toLowerCase();

    if (
      assignStatus === "pending" ||
      assignStatus === "in_progress" ||
      assignStatus === "in-progress"
    ) {
      label = "В процессе исполнения";
      color = "#faad14";
    } else if (
      assignStatus === "submitted" ||
      assignStatus === "review" ||
      assignStatus === "to_review"
    ) {
      label = "На проверке";
      color = "#722ed1";
    } else if (
      assignStatus === "done" ||
      assignStatus === "completed"
    ) {
      label = "Завершено";
      color = "#52c41a";
    } else if (assignStatus === "returned") {
      label = "На доработке";
      color = "#ff4d4f";
    } else {
      label = "В процессе исполнения";
      color = "#faad14";
    }
  } else {
    const { label: defaultLabel, color: defaultColor } =
      getCorrespondenseIncomingStatusLabel(record?.status);
    if (record?.status && record.status !== "sent") {
      label = defaultLabel;
      color = defaultColor;
    }
  }

  return (
    <Tag color={color} className="py-0! px-3! overflow-hidden! w-full! block!">
      <Typography.Text
        className="font-medium! text-[#252525]! text-center! truncate! block!"
        ellipsis
      >
        {label}
      </Typography.Text>
    </Tag>
  );
};
