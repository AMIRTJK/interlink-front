import { CreateUserDTO } from '@entities/hr';
import { useMutationQuery } from '@shared/lib';
import { Form, Input, Button, Card, Select, InputNumber } from 'antd';

export const CreateUser = () => {
  const [form] = Form.useForm();
  const { mutate, isPending } = useMutationQuery<CreateUserDTO>({
    url: "/users",
    method: "POST",
    messages: { success: "Пользователь создан", invalidate: ["FETCH_USERS"] }
  });

  return (
    <Card title="Создать пользователя" style={{ maxWidth: 500 }}>
      <Form form={form} layout="vertical" onFinish={(v) => mutate(v, { onSuccess: () => form.resetFields() })}>
        <Form.Item name="first_name" label="Имя" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="last_name" label="Фамилия"><Input /></Form.Item>
        <Form.Item name="phone" label="Телефон"><Input /></Form.Item>
        <Form.Item name="password" label="Пароль"><Input.Password /></Form.Item>
        <Form.Item name="position" label="Должность"><Input /></Form.Item>
        <Form.Item name="organization_id" label="ID Организации"><InputNumber style={{ width: '100%' }} /></Form.Item>
        <Form.Item name="roles" label="Роли"><Select mode="multiple" options={[{ value: 'manager', label: 'Manager' }]} /></Form.Item>
        <Button type="primary" htmlType="submit" loading={isPending} block>Создать сотрудника</Button>
      </Form>
    </Card>
  );
};