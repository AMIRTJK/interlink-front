import { CreatePermissionAndRoleDTO } from '@entities/hr';
import { useMutationQuery } from '@shared/lib';
import { Form, Input, Button, Card, Select } from 'antd';

export const CreatePermissionAndRole = () => {
  const { mutate, isPending } = useMutationQuery<CreatePermissionAndRoleDTO>({
    url: "/permissions-and-roles",
    method: "POST",
    messages: { success: "Роль и права созданы" }
  });

  return (
    <Card title="Конструктор Ролей и Прав" style={{ maxWidth: 500 }}>
      <Form layout="vertical" onFinish={(v) => mutate(v)}>
        <Form.Item name="name" label="Имя роли" rules={[{ required: true }]}><Input placeholder="manager" /></Form.Item>
        <Form.Item name="permissions" label="Список разрешений" rules={[{ required: true }]}>
          <Select mode="tags" style={{ width: '100%' }} placeholder="Введите права (напр. users.view)">
            <Select.Option value="users.view">users.view</Select.Option>
            <Select.Option value="ui.menu.analytics">ui.menu.analytics</Select.Option>
            <Select.Option value="ui.button.export_users">ui.button.export_users</Select.Option>
          </Select>
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={isPending} block>Создать связку</Button>
      </Form>
    </Card>
  );
};