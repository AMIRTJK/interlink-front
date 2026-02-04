import React, { useEffect } from 'react';
import { Modal, Select, Input, Button, Form, Segmented } from 'antd';
import { ICreateVisaModal, VisaTemplate } from './model';

const TEMPLATE_OPTIONS = Object.values(VisaTemplate)?.map((value) => ({
  value,
  label: value,
}));

const MODE_OPTIONS = [
  { label: 'Шаблон', value: 'template' },
  { label: 'Свой текст', value: 'custom' },
];

interface FormValues {
  mode: 'template' | 'custom';
  templateValue: VisaTemplate;
  customValue: string;
}

export const CreateVisaModal: React.FC<ICreateVisaModal> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [form] = Form.useForm<FormValues>();
  const mode = Form.useWatch('mode', form);
  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleFinish = (values: FormValues) => {
    const finalValue =
      values.mode === 'custom' ? values.customValue.trim() : values.templateValue;

    onSubmit(finalValue); 
    onClose();            
  };

  return (
    <Modal
      title={<span className="text-lg font-semibold">Создание визы</span>}
      open={open}
      onCancel={onClose} 
      centered
      width={480}
      destroyOnClose
      maskClosable={false}
      footer={[
     
        <Button key="submit" type="primary" onClick={form.submit}>
          Создать
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          templateValue: VisaTemplate.APPROVED, 
        }}
        className="pt-4"
        preserve={false}
      >
        <Form.Item name="mode" className="mb-5">
          <Segmented block options={MODE_OPTIONS} />
        </Form.Item>

        {mode === 'custom' ? (
          <Form.Item
            name="customValue"
            label="Текст визы"
          >
            <Input.TextArea
              placeholder="Введите текст решения..."
              autoSize={{ minRows: 3, maxRows: 3 }}
              maxLength={300}
              showCount
              autoFocus
            />
          </Form.Item>
        ) : (
          <Form.Item
            name="templateValue"
            label="Выберите шаблон"
          >
            <Select
              options={TEMPLATE_OPTIONS}
              size="large"
              autoFocus
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};