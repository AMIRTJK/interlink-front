import { SetRoleDTO } from '@entities/hr';
import { useMutationQuery } from '@shared/lib';
import { Form, Button, Card, Select, InputNumber } from 'antd';

export const SetUserRole = () => {
  const { mutate, isPending } = useMutationQuery<SetRoleDTO>({
    url: (data) => `/users/${data.user_id}/roles`,
    method: "POST",
    messages: { success: "Роли обновлены" }
  });

  return (
    <Card title="Назначить роли" style={{ maxWidth: 400 }}>
      <Form layout="vertical" onFinish={(v) => mutate(v)}>
        <Form.Item name="user_id" label="User ID" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item>
        <Form.Item name="roles" label="Выбор ролей" rules={[{ required: true }]}>
          <Select mode="multiple" options={[{ value: 'manager', label: 'Manager' }, { value: 'admin', label: 'Admin' }]} />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={isPending} block>Обновить доступ</Button>
      </Form>
    </Card>
  );
};