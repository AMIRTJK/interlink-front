import { Typography, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export const ProfilePage = () => {
    return (
        <div className="content-container">
            <div className="card" style={{ maxWidth: "42rem", margin: "0 auto" }}>
                <div className="flex items-center gap-6 mb-8">
                    <Avatar size={80} icon={<UserOutlined />} className="bg-blue-600" />
                    <div>
                        <Title level={2} style={{ margin: 0, color: "var(--color-text-primary)" }}>
                            User Profile
                        </Title>
                        <Text style={{ color: "var(--color-text-primary)", opacity: 0.7 }}>
                            Manage your account settings
                        </Text>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="grid gap-2">
                        <Text strong style={{ color: "var(--color-text-primary)" }}>Full Name</Text>
                        <div className="input-field">Guest User</div>
                    </div>
                    <div className="grid gap-2">
                        <Text strong style={{ color: "var(--color-text-primary)" }}>Email</Text>
                        <div className="input-field">user@example.com</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
