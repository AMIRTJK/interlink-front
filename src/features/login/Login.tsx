import { Form, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import "../../app/styles/global.css";
import { ApiRoutes } from "@shared/api";
import {
  phoneNumberRules,
  requiredRule,
  tokenControl,
  useMutationQuery,
} from "@shared/lib";
import { ILoginRequest, ILoginResponse } from "@entities/login";
const { Link } = Typography;
import "./Login.css";
import { AppRoutes } from "@shared/config";
import { Button, TextField } from "@shared/ui";
import { selectBefore } from "./lib";
import { useEffect, useState } from "react";

export const Login = () => {
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const [submittable, setSubmittable] = useState<boolean>(false);
  const values = Form.useWatch([], form);

  const { mutate, isPending } = useMutationQuery<ILoginRequest, ILoginResponse>(
    {
      url: ApiRoutes.LOGIN,
      method: "POST",
      skipAuth: true,
      messages: {
        onSuccessCb: async (data) => {
          const token = data.token;
          tokenControl.set({ token });
          tokenControl.setUserId(data?.user?.id);
          navigate(AppRoutes.PROFILE);
        },
      },
    }
  );
  const handleSubmit = (data: {
    prefix: string;
    phone: string;
    password: string;
  }) => {
    const fullPhone = `${data.prefix}${data.phone}`;
    mutate({ phone: fullPhone, password: data.password });
  };

  useEffect(() => {
    form
      .validateFields({ validateOnly: true })
      .then(() => setSubmittable(true))
      .catch(() => setSubmittable(false));
  }, [values, form]);

  return (
    <div className="login-card">
      <div className="login-header">
        <h1 className="font-bold text-white text-[20px] mb-4">
          Введите данные
        </h1>
      </div>
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        onFinish={handleSubmit}
      >
        <TextField
          label=""
          name="phone"
          rules={[phoneNumberRules]}
          className="h-14 rounded-[15px]! "
          customClass="mb-[8px]!"
          addonBefore={selectBefore}
        />
        <TextField
          type="password"
          label=""
          name="password"
          rules={[requiredRule]}
          className="h-14 rounded-[15px]! px-4!"
          placeholder="Пароль"
          customClass="big-icon mb-[8px]!"
        />
        <div className="flex justify-between mb-2">
          <Link
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-white! hover:text-[#e5e5e5]!"
          >
            Забыли пароль?
          </Link>
          <Link
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-white! hover:text-[#e5e5e5]!"
          >
            Регистрация
          </Link>
        </div>
        <div className="flex flex-col gap-4">
          <Button
            text="Отправить код"
            type="primary"
            className="bg-[#0037AF]! w-full h-14! rounded-[15px]!"
          />
          <Button
            text="Войти"
            loading={isPending}
            type="primary"
            htmlType="submit"
            className={`${!submittable ? "text-white! border-none!" : ""} bg-[#0037AF]! w-full h-14! rounded-[15px]!`}
            disabled={!submittable}
          />
        </div>
      </Form>
    </div>
  );
};
