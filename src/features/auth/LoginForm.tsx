import { Button, Form, Input, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@shared/config/routes";

const { Title, Text, Link } = Typography;

export const LoginForm = () => {
    const navigate = useNavigate();

    const onFinish = (values: { phoneNumber: string; password: string }) => {
        console.log("Login values:", values);
        if (values.phoneNumber === "km" || values.phoneNumber === "am") {
            navigate(ROUTES.PROFILE);
        }
    };

    return (
        <div className="auth-card">
            <div className="text-center mb-8">
                <Title level={2} style={{ color: "#fff", marginBottom: 0 }}>
                    Войти
                </Title>
                <Text style={{ color: "rgba(255,255,255,0.7)" }}>
                    Пожалуйста, войдите, чтобы продолжить
                </Text>
            </div>

            <Form
                name="login"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                size="large"
            >
                <Form.Item
                    name="phoneNumber"
                    rules={[{ required: true, message: "Введите номер телефона!" }]}
                >
                    <Input
                        prefix={<UserOutlined />}
                        placeholder="Номер телефона"
                        className="rounded-lg"
                    />
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[{ required: true, message: "Введите пароль!" }]}
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Пароль"
                        className="rounded-lg"
                    />
                </Form.Item>
                <Form.Item>
                    <div className="flex justify-end">
                        <Link
                            href="#"
                            onClick={(e) => e.preventDefault()}
                            style={{ color: "#69b1ff" }}
                        >
                            Забыли пароль?
                        </Link>
                    </div>
                </Form.Item>
                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-500 border-none"
                    >
                        Войти
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};
