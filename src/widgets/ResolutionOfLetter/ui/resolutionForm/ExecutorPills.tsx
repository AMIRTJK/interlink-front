import { Button, Avatar } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  CrownFilled,
  CloseOutlined,
} from "@ant-design/icons";
import { IDepartment, IUser } from "@features/SelectExecutors";
import userAvatar from "../../../../assets/images/user-avatar.jpg";

interface IProps {
  selectedUsers: IUser[];
  selectedDepts: IDepartment[];
  mainUserId?: number;
  mainDeptId?: number;
  onRemoveUser: (id: number) => void;
  onRemoveDept: (id: number) => void;
  onSetMainUser: (id: number) => void;
  onSetMainDept: (id: number) => void;
}

/** Список визуальных капсул (pills) выбранных исполнителей. */
export const ExecutorPills = ({
  selectedUsers,
  selectedDepts,
  mainUserId,
  mainDeptId,
  onRemoveUser,
  onRemoveDept,
  onSetMainUser,
  onSetMainDept,
}: IProps) => (
  <div className="flex flex-col gap-2">
    {/* Выбранные пользователи */}
    {selectedUsers.map((user) => {
      const isMain = mainUserId === user.id;
      return (
        <div
          key={user.id}
          className={`resolution__form-pill ${isMain ? "resolution__form-pill--main" : ""}`}
        >
          <div className="resolution__form-pill-info flex-1">
            <Avatar src={userAvatar} icon={<UserOutlined />} size="small" />
            <span className="resolution__form-pill-name">
              {user.full_name}
            </span>
          </div>
          <div className="resolution__form-pill-actions">
            {/* Кнопка выбора главного */}
            <Button
              type="text"
              className="resolution__form-pill-btn"
              icon={
                <CrownFilled
                  style={{
                    fontSize: "12px",
                    color: isMain ? "#1a1a1a" : "#94a3b8",
                  }}
                />
              }
              onClick={() => onSetMainUser(user.id)}
            />

            {/* Кнопка удаления */}
            <Button
              type="text"
              className="resolution__form-pill-btn danger"
              icon={<CloseOutlined style={{ fontSize: "12px" }} />}
              onClick={() => onRemoveUser(user.id)}
            />
          </div>
        </div>
      );
    })}

    {/* Выбранные отделы */}
    {selectedDepts.map((dept) => {
      const isMain = mainDeptId === dept.id;
      return (
        <div
          key={dept.id}
          className={`resolution__form-pill ${isMain ? "resolution__form-pill--main" : ""}`}
        >
          <div className="resolution__form-pill-info flex-1">
            <Avatar
              icon={<TeamOutlined />}
              size="small"
              className={isMain ? "bg-white/30" : "bg-blue-100"}
            />
            <span className="resolution__form-pill-name">{dept.name}</span>
          </div>
          <div className="resolution__form-pill-actions">
            <Button
              type="text"
              className="resolution__form-pill-btn"
              icon={
                <CrownFilled
                  style={{
                    fontSize: "12px",
                    color: isMain ? "#1a1a1a" : "#94a3b8",
                  }}
                />
              }
              onClick={() => onSetMainDept(dept.id)}
            />

            <Button
              type="text"
              className="resolution__form-pill-btn danger"
              icon={<CloseOutlined style={{ fontSize: "12px" }} />}
              onClick={() => onRemoveDept(dept.id)}
            />
          </div>
        </div>
      );
    })}
  </div>
);
