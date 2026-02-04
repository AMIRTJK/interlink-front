import { SetRoleDTO } from '@entities/hr';
import { ApiRoutes } from '@shared/api';
import { useMutationQuery } from '@shared/lib';
import { SelectField } from '@shared/ui';
import { Form, Button, Card } from 'antd';

export const SetUserRole = () => {
  const { mutate, isPending, isAllowed } = useMutationQuery<SetRoleDTO>({
    url: (data) => ApiRoutes.SET_USER_ROLES.replace(":id", String(data.user_id)),
    method: "POST",
    messages: { success: "Роли обновлены" },
    preload: true,
    preloadConditional: ["roles.update"]
  });

  const transformUsers = (res: unknown) => {
    const data = (res as { data: { data: { id: number; full_name: string }[] } })?.data?.data || [];
    return data.map((user) => ({
      value: String(user.id),
      label: user.full_name
    }));
  };

  const transformRoles = (res: unknown) => {
    const rawData = (res as { data: { data: { id: number; name: string }[] } | { id: number; name: string }[] })?.data;
    const items = (Array.isArray(rawData) ? rawData : (rawData as { data: { id: number; name: string }[] })?.data) || [];
    return items.map((role) => ({
      value: role.name,
      label: role.name
    }));
  };

  const onFinish = (values: Omit<SetRoleDTO, "user_id"> & { user_id: string }) => {
    const payload: SetRoleDTO = {
      ...values,
      user_id: Number(values.user_id)
    };
    mutate(payload);
  };

  return (
    <Card title="Назначить роли" style={{ maxWidth: 400 }}>
      <Form layout="vertical" onFinish={onFinish} disabled={!isAllowed}>
        <SelectField 
          name="user_id" 
          label="Пользователь" 
          rules={[{ required: true }]}
          url={ApiRoutes.GET_USERS}
          method="GET"
          isFetchAllowed={true}
          transformResponse={transformUsers}
          placeholder="Выберите пользователя"
        />
        <SelectField 
          name="roles" 
          label="Выбор ролей" 
          rules={[{ required: true }]}
          url={ApiRoutes.GET_ROLES}
          method="GET"
          isFetchAllowed={true}
          transformResponse={transformRoles}
          placeholder="Выберите роли"
          mode="multiple"
        />
        <Button type="primary" htmlType="submit" loading={isPending} block>Обновить доступ</Button>
      </Form>
    </Card>
  );
};