import { useState } from "react";
import { Modal, Button, Input, Form } from "antd";
import { KeyRound } from "lucide-react";
import { toast } from "@shared/lib/toast";

export const ChangePassword = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [form] = Form.useForm();

  const handleOpen = () => {
    setIsOpen(true);
    form.resetFields();
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubmit = () => {
    form.validateFields().then(() => {
      toast.success("Пароль успешно изменен");
      setIsOpen(false);
    });
  };

  return (
    <div className="sm:flex justify-between items-center gap-3 pt-4 border-t border-gray-100">
      <span className="flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
        <KeyRound className="w-4 h-4 text-indigo-500" />
        Пароль безопасности
      </span>

      <Button size="small" onClick={handleOpen}>
        Изменить
      </Button>

      <Modal
        open={isOpen}
        onCancel={handleClose}
        footer={null}
        width={360}
        centered
        title="Смена пароля"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            label="Текущий пароль"
            name="currentPassword"
            rules={[{ required: true, message: "Введите текущий пароль" }]}
          >
            <Input.Password placeholder="Введите текущий пароль" />
          </Form.Item>

          <Form.Item
            label="Новый пароль"
            name="newPassword"
            rules={[
              { required: true, message: "Введите новый пароль" },
              { min: 6, message: "Пароль должен быть не менее 6 символов" },
            ]}
          >
            <Input.Password placeholder="Введите новый пароль" />
          </Form.Item>

          <Form.Item
            label="Подтверждение нового пароля"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Подтвердите новый пароль" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Пароли не совпадают"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Повторите новый пароль" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block className="mt-2">
            Сохранить
          </Button>
        </Form>
      </Modal>
    </div>
  );
};
