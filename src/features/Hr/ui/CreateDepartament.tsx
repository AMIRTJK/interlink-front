import { CreateDepartmentDTO } from '@entities/hr';
import { useMutationQuery } from '@shared/lib';
import { Form, Input, Button, Card } from 'antd';

export const CreateDepartment = () => {
  const [form] = Form.useForm();

  const { mutate, isPending } = useMutationQuery<CreateDepartmentDTO>({
    url: "/departments", 
    method: "POST",
    messages: { 
      success: "Департамент успешно создан",
      invalidate: ["FETCH_DEPARTMENTS"] 
    }
  });

  return (
    <Card title="Создать департамент" style={{ maxWidth: 400 }}>
      <Form 
        form={form}
        layout="vertical" 
        onFinish={(v) => mutate(v, { onSuccess: () => form.resetFields() })}
      >
        <Form.Item 
          name="name" 
          label="Название отдела" 
          rules={[{ required: true, message: 'Введите название (напр. Юридический отдел)' }]}
        >
          <Input placeholder="Юридический отдел 2" />
        </Form.Item>

        <Form.Item 
          name="code" 
          label="Код отдела" 
          rules={[{ required: true, message: 'Введите код (напр. legal2)' }]}
        >
          <Input placeholder="legal2" />
        </Form.Item>

        <Button 
          type="primary" 
          htmlType="submit" 
          loading={isPending} 
          block
        >
          Создать отдел
        </Button>
      </Form>
    </Card>
  );
};