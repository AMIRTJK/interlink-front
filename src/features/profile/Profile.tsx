import { Avatar, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export const Profile = () => {
  return (
    <div className="content-container">
      <div className="card">
        <div className="profile-header">
          <Avatar size={80} icon={<UserOutlined />} className="profile-avatar" />
          <div>
            <Title level={2} className="text-white!">Профиль</Title>
            <Text className="text-white!">Профиль</Text>
          </div>
        </div>
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
