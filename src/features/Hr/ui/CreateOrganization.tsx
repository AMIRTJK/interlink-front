import { CreateOrganizationDTO } from '@entities/hr';
import { ApiRoutes } from '@shared/api';
import { useMutationQuery } from '@shared/lib';
import { Form, Input, Button, Card } from 'antd';

export const CreateOrganization = () => {
  const [form] = Form.useForm();
  const { mutate, isPending, isAllowed } = useMutationQuery<CreateOrganizationDTO>({
    url: ApiRoutes.CREATE_ORGANIZATION,
    method: "POST",
    messages: { success: "Организация создана", invalidate: [ApiRoutes.GET_ORGANIZATIONS] },
    preload: true,
    preloadConditional: ["organizations.create"]
  });

  const onFinish = (values: any) => {
    const { meta_type, meta_note, ...rest } = values;
    const payload: CreateOrganizationDTO = {
      ...rest,
      meta: { type: meta_type, note: meta_note }
    };
    mutate(payload, { onSuccess: () => form.resetFields() });
  };

  return (
    <Card title="Создать организацию" style={{ maxWidth: 600 }}>
      <Form form={form} layout="vertical" onFinish={onFinish} disabled={!isAllowed}>
        <Form.Item name="name" label="Название" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="short_name" label="Краткое название"><Input /></Form.Item>
        <Form.Item name="code" label="Код организации"><Input /></Form.Item>
        <Form.Item name="inn" label="ИНН"><Input /></Form.Item>
        <Form.Item name="phone" label="Телефон"><Input /></Form.Item>
        <Form.Item name="email" label="Email"><Input /></Form.Item>
        <Form.Item name="website" label="Website"><Input /></Form.Item>
        <Form.Item name="address" label="Адрес"><Input /></Form.Item>
        <Form.Item name="meta_type" label="Тип (meta)" initialValue="client"><Input /></Form.Item>
        <Form.Item name="meta_note" label="Заметка (meta)"><Input /></Form.Item>
        <Button type="primary" htmlType="submit" loading={isPending} block>Создать</Button>
      </Form>
    </Card>
  );
};