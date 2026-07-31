import { Avatar, Tooltip } from "antd";

const initials = (name: string) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (
    parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2)
  ).toUpperCase();
};

export const AcknowledgedUsersCell = ({ users }: { users: any[] }) => {
  const list = Array.isArray(users) ? users : [];
  if (list.length === 0) return <>—</>;

  return (
    <Avatar.Group max={{ count: 3 }} size="small">
      {list.map((au: any) => {
        const u = au?.user || au;
        return (
          <Tooltip key={au?.id || u?.id} title={u?.full_name || "Сотрудник"}>
            <Avatar
              size="small"
              style={{ backgroundColor: "#229A2E" }}
              src={u?.photo_url || u?.photo_path || undefined}
            >
              {initials(u?.full_name || "")}
            </Avatar>
          </Tooltip>
        );
      })}
    </Avatar.Group>
  );
};
