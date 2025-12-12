import { Button, Form, Input, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
// import { useNavigate } from "react-router-dom";
import "../../app/styles/global.css";
import { ApiRoutes } from "@shared/api";
import { tokenControl, useMutationQuery } from "@shared/lib";
import { ILoginRequest, ILoginResponse } from "@entities/login";
const { Title, Text, Link } = Typography;
import "./Login.css";

export const Login = () => {
  // const navigate = useNavigate();

  // const onFinish = (values: { phoneNumber: string; password: string }) => {
  //   console.log("Login values:", values);
  //   if (values.phoneNumber === "km" || values.phoneNumber === "am") {
  //     navigate(AppRoutes.PROFILE);
  //   }
  // };

  const { mutate, isPending } = useMutationQuery<ILoginRequest, ILoginResponse>(
    {
      url: ApiRoutes.LOGIN,
      method: "POST",
      skipAuth: true,
      messages: {
        onSuccessCb: async (data) => {
          const token = data.token;
          tokenControl.set({ token });
          // navigate(AppRoutes.PROFILE);
        },
      },
    }
  );

  const handleSubmit = (data: { phoneNumber: string; password: string }) => {
    mutate({ phone: data.phoneNumber, password: data.password });
  };

  return (
    <div className="login-card">
      <div className="login-header">
        <h1 className="font-bold text-white text-[20px] mb-4">
          Введите данные
        </h1>
      </div>
      <Form
        name="login"
        initialValues={{ remember: true }}
        onFinish={handleSubmit}
        size="large"
      >
        <Form.Item
          name="phoneNumber"
          rules={[{ required: true, message: "Введите номер телефона" }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Номер телефона"
            className="rounded-lg"
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: "Введите пароль" }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Пароль"
            className="rounded-lg"
          />
        </Form.Item>
        <Form.Item>
          <div className="forgot-link">
            <Link
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-link"
            >
              Забыли пароль?
            </Link>
          </div>
        </Form.Item>
        <Form.Item>
          <Button
            loading={isPending}
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
