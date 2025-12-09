import { Avatar, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Text } = Typography;

export const Profile = () => {
  return (
    <div className="content-container">
      <div className="card">
        <div className="profile-header">
          <Avatar size={80} icon={<UserOutlined />} className="profile-avatar" />
        </div>
        <p className="text-center!">ФИО ПОЛЬЗОВАТЕЛЯ</p>  
        <div className="profile-fields">
          <div className="field-group">
            <Text className="field-label">Full Name</Text>
            <div className="input-field">Профиль</div>
          </div>
          <div className="field-group">
            <Text className="field-label">Email</Text>
            <div className="input-field">Профиль</div>
          </div>
        </div>
      </div>
    </div>
  );
};
