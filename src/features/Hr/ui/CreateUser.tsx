import { CreateUserDTO } from '@entities/hr';
import { ApiRoutes } from '@shared/api';
import { useMutationQuery } from '@shared/lib';
import { SelectField } from '@shared/ui';
import { Form, Input, Button, Card } from 'antd';

export const CreateUser = () => {
  const [form] = Form.useForm();
  const { mutate, isPending, isAllowed } = useMutationQuery<CreateUserDTO>({
    url: ApiRoutes.CREATE_USER,
    method: "POST",
    messages: { success: "Пользователь создан", invalidate: ["FETCH_USERS"] },
    preload: true,
    preloadConditional: ["users.create"]
  });

  const transformOrgs = (res: unknown) => {
    const data = (res as { data: { data: { id: number; name: string }[] } })?.data?.data || [];
    return data.map((org) => ({
      value: String(org.id),
      label: org.name
    }));
  };

  const transformDeps = (res: unknown) => {
    const data = (res as { data: { data: { id: number; name: string }[] } })?.data?.data || [];
    return data.map((dep) => ({
      value: String(dep.id),
      label: dep.name
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

  const organizationId = Form.useWatch('organization_id', form);

  const onFinish = (values: Omit<CreateUserDTO, "organization_id" | "department_id"> & { organization_id: string, department_id: string }) => {
    const payload: CreateUserDTO = {
      ...values,
      organization_id: Number(values.organization_id),
      department_id: Number(values.department_id)
    };
    mutate(payload, { onSuccess: () => form.resetFields() });
  };

  return (
    <Card title="Создать пользователя" style={{ maxWidth: 500 }}>
      <Form form={form} layout="vertical" onFinish={onFinish} disabled={!isAllowed}>
        <Form.Item name="first_name" label="Имя" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="last_name" label="Фамилия"><Input /></Form.Item>
        <Form.Item name="phone" label="Телефон"><Input /></Form.Item>
        <Form.Item name="password" label="Пароль"><Input.Password /></Form.Item>
        <Form.Item name="position" label="Должность"><Input /></Form.Item>
        <SelectField 
          name="organization_id" 
          label="Организация" 
          rules={[{ required: true }]}
          url={ApiRoutes.GET_ORGANIZATIONS}
          method="GET"
          isFetchAllowed={true}
          transformResponse={transformOrgs}
          placeholder="Выберите организацию"
          onChange={(val) => {
            form.setFieldsValue({ organization_id: val, department_id: undefined });
          }}
        />
        <SelectField 
          name="department_id" 
          label="Департамент" 
          rules={[{ required: true }]}
          url={organizationId ? ApiRoutes.GET_DEPARTMENTS : undefined}
          params={organizationId ? { organization_id: organizationId } : undefined}
          method="GET"
          isFetchAllowed={!!organizationId}
          transformResponse={transformDeps}
          placeholder={organizationId ? "Выберите департамент" : "Сначала выберите организацию"}
          disabled={!organizationId}
        />
        <SelectField 
          name="roles" 
          label="Роли" 
          rules={[{ required: true }]}
          url={ApiRoutes.GET_ROLES}
          method="GET"
          isFetchAllowed={true}
          transformResponse={transformRoles}
          placeholder="Выберите роли"
          mode="multiple"
        />
        <Button type="primary" htmlType="submit" loading={isPending} block>Создать сотрудника</Button>
      </Form>
    </Card>
  );
};